#!/bin/bash

# 确保脚本在出错时停止
set -e

# 检查是否提供了合并提交的数量
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <number_of_commits_to_squash>"
    exit 1
fi

# 获取要合并的提交数量
COMMITS_TO_SQUASH=$1

# 检查是否是数字
if ! [[ "$COMMITS_TO_SQUASH" =~ ^[0-9]+$ ]]; then
    echo "Error: Number of commits to squash must be a positive integer."
    exit 1
fi

# 执行交互式变基
GIT_EDITOR="sed -i -re '2,${COMMITS_TO_SQUASH}s/^pick/squash/'" git rebase -i HEAD~"$COMMITS_TO_SQUASH"

# 检查是否有冲突
if [ $? -ne 0 ]; then
    echo "Rebase had conflicts. Please resolve them and run 'git rebase --continue'."
    exit 1
fi

echo "Commits have been squashed. Please edit the commit message if necessary."