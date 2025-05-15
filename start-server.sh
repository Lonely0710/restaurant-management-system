#!/bin/bash
echo "检查端口3001是否被占用..."
PORT_CHECK=$(sudo lsof -i:3001 | grep LISTEN)
if [ ! -z "$PORT_CHECK" ]; then
  echo "警告: 端口3001已被占用，尝试释放端口..."
  sudo kill -9 $(sudo lsof -t -i:3001) 2>/dev/null
  sleep 1
fi

echo "启动后端服务器(端口3001)..."
# 清除可能冲突的PORT环境变量
unset PORT
# 设置后端专用端口变量
export BACKEND_PORT=3001
cd "$(dirname "$0")"
echo "当前目录: $(pwd)"
sudo -E node server/index.js

# 如果脚本被中断，输出相关信息
trap 'echo "服务器已停止";' EXIT 