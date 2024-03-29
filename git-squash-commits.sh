#!/bin/bash

# 确保脚本在出错时停止
set -e

# 获取当前分支名
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# 避免在主要分支上操作
if [ "$CURRENT_BRANCH" == "master" ] || [ "$CURRENT_BRANCH" == "main" ]; then
    echo "Error: You are on $CURRENT_BRANCH branch. Please switch to a different branch before squashing commits."
    exit 1
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "Error: Working directory is not clean. Please commit or stash your changes."
    exit 1
fi

# 提供选择合并所有提交还是指定数量的提交
echo "Do you want to squash all commits into one? (y/n)"
read -r answer

if [ "$answer" != "${answer#[Yy]}" ]; then
    # 用户选择合并所有提交
    COMMITS_TO_SQUASH=$(git rev-list --count HEAD ^$(git merge-base HEAD $(git rev-parse --abbrev-ref --symbolic-full-name @{u})))
else
    # 用户选择指定数量的提交
    echo "Enter the number of commits to squash:"
    read -r COMMITS_TO_SQUASH

    # 检查是否是数字
    if ! [[ "$COMMITS_TO_SQUASH" =~ ^[0-9]+$ ]]; then
        echo "Error: Number of commits to squash must be a positive integer."
        exit 1
    fi
fi

# 执行交互式变基
GIT_EDITOR="sed -i -re '2,${COMMITS_TO_SQUASH}s/^pick/squash/'" git rebase -i HEAD~"$COMMITS_TO_SQUASH"

# 检查是否有冲突
if [ $? -ne 0 ]; then
    echo "Rebase had conflicts. Please resolve them and run 'git rebase --continue'."
    exit 1
fi

echo "Commits have been squashed. Please edit the commit message if necessary."