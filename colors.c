#include <stdio.h>

int main() {
    for(int y = 0; y < 256; y++) {
        for(int x = 0; x < 256; x++) {
            int r = 0, g = 0, b = 0;
            if(x < 85) {
                r = 255 - (x * 3);
                g = x * 3;
                b = 0;
            } else if(x < 170) {
                r = 0;
                g = 255 - ((x -85) * 3);
                b = (x - 85) * 3;
            } else {
                r = (x -170) * 3;
                g = 0;
                b = 255 - ((x - 170) * 3);
            }
            float brightness = (255 - y) / 255.0;
            printf("\033[48;2;%d;%d;%dm ", r, g, b);
        }
        printf("\n");
    }
}
