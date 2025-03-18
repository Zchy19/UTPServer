package com.macrosoft.utilities;


public class NumberUtility {

	public static Object getBitByBoolean(boolean result)
	{
		if (result) return '1';
		return '0';
	}
   
    public static int getNumberDecimalDigits(String number) {
    String moneyStr = number;
    String[] num = moneyStr.split("\\.");
    if (num.length == 2) {
        for (;;){
            if (num[1].endsWith("0")) {
                num[1] = num[1].substring(0, num[1].length() - 1);
            }else {
                break;
            }
        }
        return num[1].length();
    }else {
        return 0;
    }
}
	public static String toHexString(byte[] bytes) {
	    char[] hexArray = {'0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'};
	    char[] hexChars = new char[bytes.length * 2];
	    int v;
	    for ( int j = 0; j < bytes.length; j++ ) {
	        v = bytes[j] & 0xFF;
	        hexChars[j*2] = hexArray[v/16];
	        hexChars[j*2 + 1] = hexArray[v%16];
	    }
	    return new String(hexChars);
	}
	
	public static int hexToDecimal(String hex)
	{
		int decimal=Integer.parseInt(hex,16);  
		return decimal;
	}
	
	public static long binaryStringToDecimal(String binaryString)
	{
		return Long.valueOf(binaryString, 2);
	}

	public static String hexString2binaryString(String hexString)
	{
		if (hexString == null || hexString.length() % 2 != 0)
			return null;
		String bString = "", tmp;
		for (int i = 0; i < hexString.length(); i++)
		{
			tmp = "0000"
					+ Integer.toBinaryString(Integer.parseInt(hexString
							.substring(i, i + 1), 16));
			bString += tmp.substring(tmp.length() - 4);
		}
		return bString;
	}
	
	public static String reverseString(String source)
	{
		StringBuilder sb=new StringBuilder(source);  
		sb.reverse();  
		return sb.toString();  
	}
	
	public static String removeHeadZero(String s)
	{
		String result = s.replaceFirst("^0+(?!$)", "");
		if (result.startsWith("."))
		{
			result = "0" + result; 
		}
		
		return result;	
	}
}
