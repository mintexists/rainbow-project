precision mediump float;

uniform vec2 resolution;

uniform vec2 cursor;

uniform bool mouseDown;

uniform int i;

float mapRange(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

// vec3 mod289(vec3 x) {
//   return x - floor(x * (1.0 / 289.0)) * 289.0;
// }

// vec2 mod289(vec2 x) {
//   return x - floor(x * (1.0 / 289.0)) * 289.0;
// }

// vec3 permute(vec3 x) {
//   return mod289(((x*34.0)+10.0)*x);
// }

// float snoise(vec2 v)
//   {
//   const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
//                       0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
//                      -0.577350269189626,  // -1.0 + 2.0 * C.x
//                       0.024390243902439); // 1.0 / 41.0
// // First corner
//   vec2 i  = floor(v + dot(v, C.yy) );
//   vec2 x0 = v -   i + dot(i, C.xx);

// // Other corners
//   vec2 i1;
//   //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
//   //i1.y = 1.0 - i1.x;
//   i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
//   // x0 = x0 - 0.0 + 0.0 * C.xx ;
//   // x1 = x0 - i1 + 1.0 * C.xx ;
//   // x2 = x0 - 1.0 + 2.0 * C.xx ;
//   vec4 x12 = x0.xyxy + C.xxzz;
//   x12.xy -= i1;

// // Permutations
//   i = mod289(i); // Avoid truncation effects in permutation
//   vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
// 		+ i.x + vec3(0.0, i1.x, 1.0 ));

//   vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
//   m = m*m ;
//   m = m*m ;

// // Gradients: 41 points uniformly over a line, mapped onto a diamond.
// // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

//   vec3 x = 2.0 * fract(p * C.www) - 1.0;
//   vec3 h = abs(x) - 0.5;
//   vec3 ox = floor(x + 0.5);
//   vec3 a0 = x - ox;

// // Normalise gradients implicitly by scaling m
// // Approximation of: m *= inversesqrt( a0*a0 + h*h );
//   m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// // Compute final noise value at P
//   vec3 g;
//   g.x  = a0.x  * x0.x  + h.x  * x0.y;
//   g.yz = a0.yz * x12.xz + h.yz * x12.yw;
//   return 130.0 * dot(m, g);
// }

float approx(float v) {
    float pi = 3.1415926;
    return 1.0 + (0.05 * pow(mod(v, 2.0 * pi) - pi, 2.0)) + (0.000039 * pow(mod(v, 2.0 * pi) - pi, 8.0));
}

float radiansToIOR(float v1) {
    // \sqrt{6\cdot\sqrt[3]{\left(\sin\left(\frac{x}{4}\right)\right)^{4}\cos^{2}\left(\frac{x}{4}\right)\left(3\cos\left(\frac{x}{2}\right)+1\right)^{3}}-6\sqrt[3]{\left(\sin\left(\frac{x}{4}\right)\right)^{2}\left(\cos\left(\frac{x}{4}\right)\right)^{4}\left(3\cos\left(\frac{x}{2}\right)-1\right)^{3}}+9\cos^{2}\left(\frac{x}{2}\right)-5}
    return sqrt(6.0 * sqrt(3.0 * pow(sin(v1 / 4.0), 4.0) * cos(v1 / 4.0) * pow(3.0 * cos(v1 / 2.0) + 1.0, 3.0) - 6.0 * sqrt(3.0 * pow(sin(v1 / 4.0), 2.0) * pow(cos(v1 / 4.0), 4.0) * pow(3.0 * cos(v1 / 2.0) - 1.0, 3.0) + 9.0 * cos(v1 / 2.0) - 5.0)));
}

float iorToWavelength(float x) {
    //-7877326844.241+23534968659.800x+-26366912646.386x^{2}+13128117166.748x^{3}+-2451078769.845x^{4}
    // return -7877326844.241 + (23534968659.800 * x) + (-26366912646.386 * x * x) + (13128117166.748 * x * x * x) + (-2451078769.845 * x * x * x * x);
    float a = 348.578;
    float b = 1192.602;
    float c = -1.355;

    if (x > 1.355) {
        return 0.0;
    }

    return a * exp(b * pow(x + c, 2.0));
}

vec4 wavelengthToRGB(float w) {
    float red;
    float green;
    float blue;

    if (w >= 380.0 && w < 440.0) {
        red   = -(w - 440.0) / (440.0 - 380.0);
        green = 0.0;
        blue  = 1.0;
    }
    else if (w >= 440.0 && w < 490.0) {
        red   = 0.0;
        green = (w - 440.0) / (490.0 - 440.0);
        blue  = 1.0;
    }
    else if (w >= 490.0 && w < 510.0) {
        red   = 0.0;
        green = 1.0;
        blue  = -(w - 510.0) / (510.0 - 490.0);
    }
    else if (w >= 510.0 && w < 580.0) {
        red   = (w - 510.0) / (580.0 - 510.0);
        green = 1.0;
        blue  = 0.0;
    }
    else if (w >= 580.0 && w < 645.0) {
        red   = 1.0;
        green = -(w - 645.0) / (645.0 - 580.0);
        blue  = 0.0;
    }
    else if (w >= 645.0 && w < 781.0) {
        red   = 1.0;
        green = 0.0;
        blue  = 0.0;
    }
    else {
        red   = 0.0;
        green = 0.0;
        blue  = 0.0;
    }

    float factor;

    if (w >= 380.0 && w < 420.0) {
        factor = 0.3 + 0.7*(w - 380.0) / (420.0 - 380.0);
    }
    else if (w >= 420.0 && w < 701.0) {
        factor = 1.0;
    }
    else if (w >= 701.0 && w < 781.0) {
        factor = 0.3 + 0.7*(780.0 - w) / (780.0 - 700.0);
    }
    else {
        factor = 0.0;
    }

    float gamma = 0.8;

    // red   = pow(red   * factor, gamma);
    // green = pow(green * factor, gamma);
    // blue  = pow(blue  * factor, gamma);

    red   = pow(red  , gamma);
    green = pow(green, gamma);
    blue  = pow(blue , gamma);

    return vec4(red, green, blue, factor);

}

void main() {

    float pixelX = gl_FragCoord.x;
    float pixelY = gl_FragCoord.y;
    float pixelIndex = (pixelX + (resolution.y - pixelY) * resolution.x) - (resolution.x / 2.0);

    // if (float(i) <= pixelIndex) {
    //     discard;
    // }

    float fov = 90.0;

    vec2 uv = gl_FragCoord.xy / resolution;

    float zDist = (1.0) / tan(radians(fov) / 2.0);

    // float yaw = atan(mapRange(uv.x, 0.0, 1.0, -1.0, 1.0), zDist);
    // float pitch = atan(mapRange(uv.y, 0.0, 1.0, -1.0, 1.0), zDist);
    float angle = atan(distance(uv, vec2(0.5)) * 2.0, zDist);
    if (mouseDown) {
        angle = atan(distance(uv, (vec2(1.0) - cursor)), zDist);
    }

    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);

    // const int iter = 10;

    // for (int i = 0; i < iter; i++) {
    //     color += wavelengthToRGB(iorToWavelength(approx(degrees(angle + (snoise((uv + vec2(i)) * 1e5) / 1e3) ))));
    // }

    // color /= float(iter);

    color = wavelengthToRGB(iorToWavelength(approx(angle)));
    
    gl_FragColor = color;
}