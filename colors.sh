#!/usr/bin/env bash

for y in {1..20};
do
    for x in {1..100};
    do
        echo -ne "\033[48;2;$((y*10-1));$((x*2-1));128m "
    done
    echo ""
done

