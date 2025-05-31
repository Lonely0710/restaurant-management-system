import { pool } from '../config/db.js';

// 辅助函数：设置事务隔离级别
const setIsolationLevel = async (connection, level) => {
    const validLevels = ['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE'];
    const upperLevel = level.toUpperCase();
    if (!validLevels.includes(upperLevel)) {
        throw new Error(`Invalid isolation level: ${level}. Valid levels are: ${validLevels.join(', ')}`);
    }
    await connection.query(`SET TRANSACTION ISOLATION LEVEL ${upperLevel}`);
    console.log(`Set isolation level to ${upperLevel}`);
};

// 模拟脏读测试
export const runDirtyReadTest = async (req, res) => {
    const { menuId, isolationLevel = 'READ UNCOMMITTED' } = req.query;
    let connection1 = null;
    let connection2 = null;
    const results = {};

    if (!menuId) {
        return res.status(400).json({ error: 'menuId is required' });
    }

    try {
        connection1 = await pool.getConnection();
        connection2 = await pool.getConnection();

        // 设置隔离级别
        await setIsolationLevel(connection1, isolationLevel);
        await setIsolationLevel(connection2, isolationLevel);

        // 事务 1 (模拟读取)
        await connection1.beginTransaction();
        console.log('Transaction 1 started');

        // 事务 2 (模拟写入未提交数据)
        await connection2.beginTransaction();
        console.log('Transaction 2 started');

        // T1: 第一次读取
        console.log('T1: First read...');
        const [rows1_1] = await connection1.query('SELECT price FROM Menu WHERE menu_id = ?', [menuId]);
        results.T1_read1 = rows1_1.length ? rows1_1[0].price : null;
        console.log(`T1: Read price = ${results.T1_read1}`);

        // T2: 更新数据但不提交
        const newPrice = parseFloat(results.T1_read1) + 10;
        console.log(`T2: Updating price to ${newPrice} (not committing)...`);
        await connection2.query('UPDATE Menu SET price = ? WHERE menu_id = ?', [newPrice, menuId]);

        // 等待 T1 读取脏数据
        await new Promise(resolve => setTimeout(resolve, 100));

        // T1: 第二次读取 (可能读到 T2 未提交的数据)
        console.log('T1: Second read...');
        const [rows1_2] = await connection1.query('SELECT price FROM Menu WHERE menu_id = ?', [menuId]);
        results.T1_read2 = rows1_2.length ? rows1_2[0].price : null;
        console.log(`T1: Read price = ${results.T1_read2}`);

        // T2: 回滚
        console.log('T2: Rolling back...');
        await connection2.rollback();

        // T1: 提交 (虽然这里 T1 没有修改数据，提交是为了结束事务)
        console.log('T1: Committing...');
        await connection1.commit();

        // 最后读取实际值，用于对比验证
        const [finalRows] = await pool.query('SELECT price FROM Menu WHERE menu_id = ?', [menuId]);
        results.finalPriceAfterRollback = finalRows.length ? finalRows[0].price : null;

        results.isolationLevel = isolationLevel;
        results.scenario = 'Dirty Read';
        results.description = '事务A读取了事务B未提交的数据，然后事务B回滚';
        results.dirtyReadOccurred = (results.T1_read1 !== results.T1_read2) && (results.T1_read2 !== results.finalPriceAfterRollback);

        res.json({ success: true, message: 'Dirty Read Test Completed', results });

    } catch (error) {
        console.error('Error running Dirty Read test:', error);
        if (connection1) {
            try { await connection1.rollback(); } catch (rbErr) { console.error('Error rolling back connection 1:', rbErr); }
        }
        if (connection2) {
            try { await connection2.rollback(); } catch (rbErr) { console.error('Error rolling back connection 2:', rbErr); }
        }
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection1) connection1.release();
        if (connection2) connection2.release();
    }
};

// 模拟不可重复读测试
export const runNonRepeatableReadTest = async (req, res) => {
    const { menuId, isolationLevel = 'READ COMMITTED' } = req.query;
    let connection1 = null;
    let connection2 = null;
    const results = {};

    if (!menuId) {
        return res.status(400).json({ error: 'menuId is required' });
    }

    // 获取初始价格用于后续恢复
    const [initialRows] = await pool.query('SELECT price FROM Menu WHERE menu_id = ?', [menuId]);
    const initialPrice = initialRows.length ? parseFloat(initialRows[0].price) : null;
    if (initialPrice === null) {
        return res.status(404).json({ error: 'Menu item not found' });
    }
    results.initialPrice = initialPrice;

    try {
        connection1 = await pool.getConnection();
        connection2 = await pool.getConnection();

        // 设置隔离级别
        await setIsolationLevel(connection1, isolationLevel);
        await setIsolationLevel(connection2, isolationLevel);

        // 事务 1 (模拟多次读取)
        await connection1.beginTransaction();
        console.log('Transaction 1 started');

        // T1: 第一次读取
        console.log('T1: First read...');
        const [rows1_1] = await connection1.query('SELECT price FROM Menu WHERE menu_id = ?', [menuId]);
        results.T1_read1 = rows1_1.length ? parseFloat(rows1_1[0].price) : null;
        console.log(`T1: Read price = ${results.T1_read1}`);

        // 事务 2 (模拟更新并提交数据)
        await connection2.beginTransaction();
        console.log('Transaction 2 started');

        // T2: 更新数据并提交
        const newPrice = initialPrice + 15;
        console.log(`T2: Updating price to ${newPrice} and committing...`);
        await connection2.query('UPDATE Menu SET price = ? WHERE menu_id = ?', [newPrice, menuId]);
        await connection2.commit();
        console.log('T2: Committed');

        // 等待 T1 再次读取
        await new Promise(resolve => setTimeout(resolve, 100));

        // T1: 第二次读取 (在 RC/RU 下应读到 T2 提交的新数据)
        console.log('T1: Second read...');
        const [rows1_2] = await connection1.query('SELECT price FROM Menu WHERE menu_id = ?', [menuId]);
        results.T1_read2 = rows1_2.length ? parseFloat(rows1_2[0].price) : null;
        console.log(`T1: Read price = ${results.T1_read2}`);

        // T1: 提交
        console.log('T1: Committing...');
        await connection1.commit();

        // 恢复数据到初始状态
        console.log(`Restoring price to ${initialPrice}...`);
        await pool.query('UPDATE Menu SET price = ? WHERE menu_id = ?', [initialPrice, menuId]);

        results.isolationLevel = isolationLevel;
        results.scenario = 'Non-repeatable Read';
        results.description = '在同一事务中，多次读取同一数据，数据内容被其他已提交的事务修改';
        results.nonRepeatableReadOccurred = results.T1_read1 !== results.T1_read2;

        res.json({ success: true, message: 'Non-repeatable Read Test Completed', results });

    } catch (error) {
        console.error('Error running Non-repeatable Read test:', error);
        // 尝试恢复数据，即使出错
        try { await pool.query('UPDATE Menu SET price = ? WHERE menu_id = ?', [initialPrice, menuId]); } catch (restoreErr) { console.error('Error restoring price after non-repeatable read test:', restoreErr); }

        if (connection1) {
            try { await connection1.rollback(); } catch (rbErr) { console.error('Error rolling back connection 1:', rbErr); }
        }
        if (connection2) {
            try { await connection2.rollback(); } catch (rbErr) { console.error('Error rolling back connection 2:', rbErr); }
        }
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection1) connection1.release();
        if (connection2) connection2.release();
    }
};

// 模拟丢失修改测试
export const runLostUpdateTest = async (req, res) => {
    const { menuId, isolationLevel = 'READ COMMITTED' } = req.query;
    let connection1 = null;
    let connection2 = null;
    const results = {};

    if (!menuId) {
        return res.status(400).json({ error: 'menuId is required' });
    }

    // 获取初始价格用于后续恢复
    const [initialRows] = await pool.query('SELECT price FROM Menu WHERE menu_id = ?', [menuId]);
    const initialPrice = initialRows.length ? parseFloat(initialRows[0].price) : null;
    if (initialPrice === null) {
        return res.status(404).json({ error: 'Menu item not found' });
    }
    results.initialPrice = initialPrice;

    try {
        connection1 = await pool.getConnection();
        connection2 = await pool.getConnection();

        // 设置隔离级别
        await setIsolationLevel(connection1, isolationLevel);
        await setIsolationLevel(connection2, isolationLevel);

        // 事务 1
        await connection1.beginTransaction();
        console.log('Transaction 1 started');

        // 事务 2
        await connection2.beginTransaction();
        console.log('Transaction 2 started');

        // T1: 读取初始价格
        console.log('T1: Reading price...');
        const [rows1] = await connection1.query('SELECT price FROM Menu WHERE menu_id = ?', [menuId]);
        const price1 = rows1.length ? parseFloat(rows1[0].price) : initialPrice;
        results.T1_read_price = price1;
        console.log(`T1: Read price = ${price1}`);

        // T2: 读取初始价格
        console.log('T2: Reading price...');
        const [rows2] = await connection2.query('SELECT price FROM Menu WHERE menu_id = ?', [menuId]);
        const price2 = rows2.length ? parseFloat(rows2[0].price) : initialPrice;
        results.T2_read_price = price2;
        console.log(`T2: Read price = ${price2}`);

        // T1: 修改价格并提交
        const newPrice1 = price1 + 5;
        console.log(`T1: Updating price to ${newPrice1} and committing...`);
        await connection1.query('UPDATE Menu SET price = ? WHERE menu_id = ?', [newPrice1, menuId]);
        // 模拟一些工作时间
        await new Promise(resolve => setTimeout(resolve, 50));
        await connection1.commit();
        console.log('T1: Committed');

        // T2: 修改价格并提交 (可能丢失 T1 的修改)
        const newPrice2 = price2 + 10;
        console.log(`T2: Updating price to ${newPrice2} and committing...`);
        await connection2.query('UPDATE Menu SET price = ? WHERE menu_id = ?', [newPrice2, menuId]);
        // 模拟一些工作时间
        await new Promise(resolve => setTimeout(resolve, 50));
        await connection2.commit();
        console.log('T2: Committed');

        // 最后读取最终价格
        const [finalRows] = await pool.query('SELECT price FROM Menu WHERE menu_id = ?', [menuId]);
        const finalPrice = finalRows.length ? parseFloat(finalRows[0].price) : initialPrice;
        results.finalPrice = finalPrice;

        // 恢复数据到初始状态
        console.log(`Restoring price to ${initialPrice}...`);
        await pool.query('UPDATE Menu SET price = ? WHERE menu_id = ?', [initialPrice, menuId]);

        results.isolationLevel = isolationLevel;
        results.scenario = 'Lost Update';
        results.description = '两个事务同时读取数据并修改，后一个事务的修改覆盖了前一个事务的修改';

        // 理论上预期的最终价格 (如果在没有并发问题的情况下，应该是 initialPrice + 5 + 10)
        const expectedPriceWithoutConcurrency = initialPrice + 5 + 10;
        // 判断是否发生丢失修改：最终价格不是预期值
        results.lostUpdateOccurred = finalPrice !== expectedPriceWithoutConcurrency;
        results.expectedPriceWithoutConcurrency = expectedPriceWithoutConcurrency;

        res.json({ success: true, message: 'Lost Update Test Completed', results });

    } catch (error) {
        console.error('Error running Lost Update test:', error);
        // 尝试恢复数据，即使出错
        try { await pool.query('UPDATE Menu SET price = ? WHERE menu_id = ?', [initialPrice, menuId]); } catch (restoreErr) { console.error('Error restoring price after lost update test:', restoreErr); }

        if (connection1) {
            try { await connection1.rollback(); } catch (rbErr) { console.error('Error rolling back connection 1:', rbErr); }
        }
        if (connection2) {
            try { await connection2.rollback(); } catch (rbErr) { console.error('Error rolling back connection 2:', rbErr); }
        }
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (connection1) connection1.release();
        if (connection2) connection2.release();
    }
}; 