/*!
 * MIT License
 * Copyright (c) 2025 Greg Henle
 * 
 * Color Controls: CC module
 *
 * The objective of this module is to provide developers with the means to
 * ensure the 7:1 contrast ratio in dynamic JS applications to provide a
 * higher level of contrast to make it easier for people with low vision.
 *
 * @url https://www.w3.org/TR/WCAG20-TECHS/G17.html
 *
 * Author: Greg Henle
 * Rev Date: 2025-04-22 15:36:14
 */

/*
 * Utility prototype function for hsl2hex
 * specifically for positive integers
 */
if ( !Number.prototype.toUHex ) {
  Number.prototype.toUHex = function() {
      var t = Math.abs(this);
      var b = (t)? Math.ceil(Math.sqrt(t)/16):1;
      var n = t.toString(16);
      var zeroString = new Array( 1+Math.pow(2,b)-n.length ).join(0);
      return zeroString+n;
  }
}

const CC = {
  /*
   * Convert a RGB array with values between 0 to 255 to a HTML 6 char
   * color code
   *
   * @param: array, rgb = RGB color array
   * @praram: bool, p = add "#" prefix to HTML color code defaults to true
   * @return: string, HTML color code
   */
  rgb2hex: function ( rgb, p )
  {
    var prefix = (typeof p == 'undefined' || p)? '#':'';
    var RsHEX = rgb[0].toUHex();
    var GsHEX = rgb[1].toUHex();
    var BsHEX = rgb[2].toUHex();
    
    return prefix+RsHEX+GsHEX+BsHEX;
  },
  /*
   * Convert HTML 6 char color code to RGB array with values between
   * 0 to 255
   *
   * @param: string, hex = #000000 or 000000 color format
   * @return: array, RGB color array
   */
  hex2rgb: function( hex )
  {
    if ( !hex ) {
      return false;
    }

    var rgb = hex.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i), ret=[0,0,0];
    ret[0] = parseInt('0x'+rgb[1]);
    ret[1] = parseInt('0x'+rgb[2]);
    ret[2] = parseInt('0x'+rgb[3]);
    
    return ret;
  },
  /*
   * Utility function for hsl2hex
   *
   * @param: float m1 = modified lightness calculation 1
   * @param: float m2 = modified lightness calculation 2
   * @param: float, h = hue, range = 0 to 1
   * @return: float, the modified lightness value.
   */
  hsl2hexUtil: function(m1, m2, h)
  {
    var h = (h < 0)? h+1:((h > 1)? h-1:h);
    if(h*6 < 1)
      return m1+(m2-m1)*h*6;
    if(h*2 < 1)
      return m2;
    if(h*3 < 2)
      return m1+(m2-m1)*(0.66666-h)*6;
    return m1;
  },
  /*
   * Converts hue, saturation, lightness to HTML color code
   * @url: https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB_alternative
   *
   * @param: float, h = hue, range = 0 to 1
   * @param: float, s = saturation, range = 0 to 1
   * @param: float, l = lightness, range = 0 to 1
   * @praram: bool, p = add "#" prefix to HTML color code defaults to true
   * @return: string, HTML color code
   */
  hsl2hex: function (h, s, l, p)
  {
    p = (typeof p == 'undefined')? true:p;
  
    m2 = (l<=0.5)? l*(s+1):l+s-l*s;
    m1 = l*2-m2;
    return ((p)?'#':'') +
      Math.round(this.hsl2hexUtil(m1, m2, h+0.33333)*255).toUHex() +
      Math.round(this.hsl2hexUtil(m1, m2, h)*255).toUHex() +
      Math.round(this.hsl2hexUtil(m1, m2, h-0.33333)*255).toUHex();
  },
  /*
   * Caculate a color's luminance from it's RGB values
   *
   * @param: array, rgb = RGB color array
   * @return: float, luminance, range 0 to 1
   */
  luminance: function ( rgb )
  {
    var RsRGB = rgb[0]/255;
    var GsRGB = rgb[1]/255;
    var BsRGB = rgb[2]/255;
    
    var R = (RsRGB <= 0.03928)? RsRGB/12.92:Math.pow((RsRGB+0.055)/1.055, 2.4);
    var G = (GsRGB <= 0.03928)? GsRGB/12.92:Math.pow((GsRGB+0.055)/1.055, 2.4);
    var B = (BsRGB <= 0.03928)? BsRGB/12.92:Math.pow((BsRGB+0.055)/1.055, 2.4);
    
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  },
  /*
   * Caculate a color's brightness from it's RGB values
   *
   * @param: array, rgb = RGB color array
   * @return: int, brightness range 0 to 255
   */
  brightness: function ( rgb )
  {
    return ((rgb[0]*299) + (rgb[1]*587) + (rgb[2]*114)) / 1000;
  },
  /*
   * Caculate color difference between two colors
   *
   * @param: array, rgb1 = RGB color array
   * @param: array, rgb2 = RGB color array
   * @return: int, difference
   */
  difference: function ( rgb1, rgb2 )
  {
    return (Math.max(rgb1[0], rgb2[0]) - Math.min(rgb1[0], rgb2[0])) + (Math.max(rgb1[1], rgb2[1]) - Math.min(rgb1[1], rgb2[1])) + (Math.max(rgb1[2], rgb2[2]) - Math.min(rgb1[2], rgb2[2]));
  },
  /*
   * From a RGB array, caculate and return the highest contrast ratio
   *
   * @param: array, rgb1 = RGB color array
   * @param: array, rgb2 = RGB color array
   * @return: float ratio X in X:1
   */
  contrastRatio: function ( rgb1, rgb2 )
  {
    var L1 = this.luminance( rgb1 );
    var L2 = this.luminance( rgb2 );

    return ( L2 < L1 )
      ? (L1 + 0.05) / (L2 + 0.05)
      : (L2 + 0.05) / (L1 + 0.05);
  },
  /*
   * From a RGB array, caculate and return the highest contrasting color
   * between white or black
   *
   * @param: array, rgb = RGB color array
   * @param: bool, p = add "#" prefix to HTML color code defaults to true
   * @return: string, HTML color code
   */
  contrastHex: function ( rgb, p )
  {
    var prefix = (typeof p == 'undefined' || p)? '#':'';
    var check = 0;
    var L = this.luminance( rgb );
    check += ( L<0.5 )? 1:0;
    
    var B = this.brightness( rgb );
    check += ( B<128 )? 1:0;
    
    var DW = this.difference( rgb, [255, 255, 255] );
    var DB = this.difference( rgb, [0, 0, 0] );
    check += ( DW > DB )? 1:0;
    
    return ( check > 1 )? prefix+'ffffff':prefix+'000000';
  },
  /*
   * This function will return an array of HTML formatted colors pairs alternating
   * by 180 degrees in hues. Equally spaced around a HSL color wheel based on the
   * "r" function parameter.
   *
   * Setting the ws parameter to true will return web safe colors.
   *
   * @param: int, r = number of colors 
   * @param: bool, ws = web safe colors.
   * @return: array, HTML color codes
   */
  colorWheel: function(r, ws)
  {
    var x1 = 45/360, xm = 120/360, x2 = 195/360, bl = 0.5, h1 = 0, c = new Array();
    if(typeof ws!='undefined' && ws){
      var hi=(15/r)/30;
      if(hi<1/30)
        hi=1/30;
    }else{
      var hi=(180/r)/360;
      if(hi<1/360)
        hi=1/360;
    }
    
    do
    {
      var h2 = h1+0.5;
      c.push(this.hsl2hex(h1, 1, bl));
      c.push(this.hsl2hex(h2, 1, bl));
      h1+=hi;
    }
    while(h1 < 0.5)
    
    return c;
  }
}


export { CC };
