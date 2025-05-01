#!/bin/bash

# Script to copy a folder from local to server using scp

local_folder="D:/skyfields2.admin/dist"
server_username="root"
server_address="192.168.1.137"
server_folder="/usr/share/nginx/Skyfields Productions/"

ssh "$server_username@$server_address" "rm -rf $server_folder/*"

scp -r "$local_folder"/* "$server_username@$server_address:$server_folder"
