package com.macrosoft.utilities;

import java.text.DecimalFormat;
import java.text.NumberFormat;

public class IcdUtility {


	public static String resolveLableIndex(String full32Bits)
	{
		String actual32bits = IcdUtility.removeHeadZero(full32Bits);
		String reversedFull32Bits = IcdUtility.reverseString(actual32bits);
		
		String label1 = selectBits(reversedFull32Bits, 1, 2);
		String label2 = selectBits(reversedFull32Bits, 3, 5);
		String label3 = selectBits(reversedFull32Bits, 6, 8);
		
		String label1Value =  IcdUtility.binaryStringToDecimal(label1);
		String label2Value =  IcdUtility.binaryStringToDecimal(label2);
		String label3Value =  IcdUtility.binaryStringToDecimal(label3);
		
		String labelIndex = label1Value + label2Value + label3Value;
		return labelIndex;
	}
	

	public static String resolveSsm(String full32Bits, int startBit, int endBit)
	{
		String reversedFull32Bits = IcdUtility.reverseString(full32Bits);	
		String ssmBits = selectBits(reversedFull32Bits, endBit, startBit);
		String ssmValue =  IcdUtility.binaryStringToDecimal(ssmBits);
		
		return ssmValue;
	}
	
	public static String resolveDigitalBits(String full32Bits, int startBit, int endBit, int digits, int digitSize)
	{
		String reversedFull32Bits = IcdUtility.reverseString(full32Bits);
		
		String result = "";
		
		int currentBitIndex = endBit;
		while (currentBitIndex < startBit)
		{
			String numBits = "";
			int nextBitIndex = currentBitIndex + digitSize -1;
			if (nextBitIndex >= startBit)
			{
				numBits = selectBits(reversedFull32Bits, currentBitIndex, startBit);
			}
			else
			{
				numBits = selectBits(reversedFull32Bits, currentBitIndex, nextBitIndex);
			}

			currentBitIndex = currentBitIndex + digitSize;
			String reversedNumBits = IcdUtility.reverseString(numBits);
			
			result = IcdUtility.binaryStringToDecimal(reversedNumBits) + result;
		}
		

		return result;
	}
	
    public static String formatBcdValue(String bcdValue, int precisionDigits) {
    	int originalPrecisionDigits = precisionDigits;
    	double bcd = Double.parseDouble(bcdValue);
		while (precisionDigits > 0)
		{
			bcd = bcd * 0.1;
			precisionDigits = precisionDigits -1;
		}
		
		NumberFormat numberFormat = NumberFormat.getInstance();
		DecimalFormat numberDecimalFormat = (DecimalFormat) numberFormat;
		numberDecimalFormat.setMaximumFractionDigits(originalPrecisionDigits);

		String result = numberDecimalFormat.format(bcd);
		return IcdUtility.removeHeadZero(result);
    }
    
    public static String getLastChar(String number)
    {
        return number.substring(number.length()-1, number.length());
    }
    
    public static String removeDigits(String number)
    {
    	if (!number.contains(".")) return number;

    	String s = number.substring(0, number.indexOf("."));
    	return s;
    }
	
    public static int getLengthOfDigits(String number)
    {
    	if (!number.contains(".")) return 0;

    	String digits = number.substring(number.indexOf(".") + 1);
    	return digits.length();
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
	
	public static String binaryStringToDecimal(String binaryString)
	{
		return Integer.valueOf(binaryString, 2).toString();
	}

	public static String addZeroHeader(String source, int length)
	{
		source = source.trim();
		while(source.length() < length)
		{
			source = "0" + source;
		}
		
		return source;
	}

	public static String addZeroTail(String source, int length)
	{
		source = source.trim();
		while(source.length() < length)
		{
			source = source + "0";
		}
		
		return source;
	}
	
	public static String DecimalToBinaryString(int decimal)
	{
		return Integer.toBinaryString(decimal);
	}
/*	
	public static String binaryString2HexString(String binaryString)
	{
        int decimal = Integer.parseInt(binaryString,2);
        String hexStr = Integer.toString(decimal,16);
		return hexStr;
	}
*/
	
	public static String binaryString2HexString(String binaryString) {
		String result = String.format("%21X", Long.parseLong(binaryString,2));
		result = result.trim();
		return  result;
	}
	

	public static String longBinaryString2HexString(String binaryString) {
		String result = "";
		while (binaryString.length() > 4)
		{
			String letter = binaryString.substring(0, 4);
			result = result + String.format("%21X", Long.parseLong(letter,2)).trim();
			binaryString = binaryString.substring(4);
		}
		
		result = result + String.format("%21X", Long.parseLong(binaryString,2)).trim();
		
		result = result.trim();
		return  result;
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

	public static String selectBits(String reversedFull32Bits, int startBit, int endBit)
	{
		return reversedFull32Bits.substring(startBit-1, endBit);
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
	
	public static String updateFrame(String sequencedFrame, int startIndex, String data)
	{
		char[] chars = sequencedFrame.toCharArray();
		char[] dataChars = data.toCharArray();
		for (int i =startIndex; i < startIndex + data.length(); i++)
		{
			chars[i] = dataChars[i - startIndex];
		}
		
		return new String(chars);	
	}
}
