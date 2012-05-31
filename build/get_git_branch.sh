#!/bin/bash

################################################
# 
# Get the current git branch
#
################################################

branch_name=$(git symbolic-ref -q HEAD)
branch_name=${branch_name##refs/heads/}
branch_name=${branch_name:-HEAD}

echo $branch_name