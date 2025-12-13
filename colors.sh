#!/usr/bin/env bash

# 1. Define the message and grid size
RAW_MSG=$1
RAW_MSG=${RAW_MSG:-"Hello World!!"}
MSG="\033[1;31m${RAW_MSG}"
MSG_LEN=${#MSG}
WIDTH=100
HEIGHT=20

# 2. Calculate coordinates to center the text
START_Y=$((HEIGHT / 2))
START_X=$(( (WIDTH / 2) - (MSG_LEN / 2) ))
END_X=$((START_X + MSG_LEN))

# 3. Hide Cursor for a cleaner look
echo -ne "\033[?25l"

for y in $(seq 1 $HEIGHT);
do
    for x in $(seq 1 $WIDTH);
    do
        # Set the gradient background color
        # Note: Fixed Green value 256 -> 255 (Max RGB is 255)
        echo -ne "\033[48;2;$((x*2));255;$((y*10))m"

        # 4. Check if we are at the specific coordinate to print text
        if [[ $y -eq $START_Y && $x -ge $START_X && $x -lt $END_X ]]; then
            # Calculate which character to print based on x position
            CHAR_INDEX=$((x - START_X))
            echo -n "${MSG:$CHAR_INDEX:1}"
        else
            # Otherwise, just print a space (color block)
            echo -n " "
        fi
    done

    # Reset color at the end of the row and move to new line
    echo -e "\033[0m"
done

# Show Cursor again
echo -ne "\033[?25h"
