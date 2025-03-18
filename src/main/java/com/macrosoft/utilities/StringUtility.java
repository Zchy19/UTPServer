package com.macrosoft.utilities;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

public class StringUtility {
	
	public static String replaceFirst(String source, String target, String replacement)
    {
    	StringBuilder b = new StringBuilder(source);
    	int start = source.indexOf(target);
    	if (start < 0) return source;
 
    	b.replace(start,start + target.length(), replacement);
    	return b.toString();
    }

	public static String replaceLast(String source, String target, String replacement)
    {
    	StringBuilder b = new StringBuilder(source);
    	int start = source.lastIndexOf(target);
    	if (start < 0) return source;
    	
    	b.replace(start,start + target.length(), replacement);
    	return b.toString();
    }
    
	public static ParserResult<Long> parseLongSafely(String value)
	{
		try
		{
			long result = Long.parseLong(value);
			
			ParserResult<Long> parserResult = new ParserResult<Long>();
			parserResult.setParserSuccess(true);
			parserResult.setResult(result);
			return parserResult;
		}
		catch (Exception ex)
		{
			ParserResult<Long> parserResult = new ParserResult<Long>();
			parserResult.setParserSuccess(false);
			return parserResult;
		}
	}

	public static ParserResult<Integer> parseIntegerSafely(String value)
	{
		try
		{
			int result = Integer.parseInt(value);
			
			ParserResult<Integer> parserResult = new ParserResult<Integer>();
			parserResult.setParserSuccess(true);
			parserResult.setResult(result);
			return parserResult;
		}
		catch (Exception ex)
		{
			ParserResult<Integer> parserResult = new ParserResult<Integer>();
			parserResult.setParserSuccess(false);
			return parserResult;
		}
	}

	public static ParserResult<Float> parseFloatSafely(String value)
	{
		try
		{
			float result = Float.parseFloat(value);
			
			ParserResult<Float> parserResult = new ParserResult<Float>();
			parserResult.setParserSuccess(true);
			parserResult.setResult(result);
			return parserResult;
		}
		catch (Exception ex)
		{
			ParserResult<Float> parserResult = new ParserResult<Float>();
			parserResult.setParserSuccess(false);
			return parserResult;
		}
	}

	public static ParserResult<Boolean> parseBooleanSafely(String value)
	{
		try
		{
			boolean result = Boolean.parseBoolean(value);
			
			ParserResult<Boolean> parserResult = new ParserResult<Boolean>();
			parserResult.setParserSuccess(true);
			parserResult.setResult(result);
			return parserResult;
		}
		catch (Exception ex)
		{
			ParserResult<Boolean> parserResult = new ParserResult<Boolean>();
			parserResult.setParserSuccess(false);
			return parserResult;
		}
	}
	public static ParserResult<Date> parseDateSafely(String value)
	{
		try
		{
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			Date result = sdf.parse(value); 
			
			ParserResult<Date> parserResult = new ParserResult<Date>();
			parserResult.setParserSuccess(true);
			parserResult.setResult(result);
			return parserResult;
		}
		catch (Exception ex)
		{
			ParserResult<Date> parserResult = new ParserResult<Date>();
			parserResult.setParserSuccess(false);
			return parserResult;
		}
	}

	public static ParserResult<Date> parseDateTimeSafely(String value)
	{
		try
		{
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss:SSS");
			Date result = sdf.parse(value); 
			
			ParserResult<Date> parserResult = new ParserResult<Date>();
			parserResult.setParserSuccess(true);
			parserResult.setResult(result);
			return parserResult;
		}
		catch (Exception ex)
		{
			ParserResult<Date> parserResult = new ParserResult<Date>();
			parserResult.setParserSuccess(false);
			return parserResult;
		}
	}
	
	public static String GetFormatedDateTime(Date date)
	{
		DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");  
		String strDate = dateFormat.format(date);  
		
		return strDate;
	}
	

	public static String GenerateUniqueIdByNow()
	{
		 DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyMMddhhmmssMs");  
		 LocalDateTime now = LocalDateTime.now();  
		   //System.out.println(dtf.format(now));  
		 return dtf.format(now);

		 /*
		Date dNow = new Date();
	    SimpleDateFormat ft = new SimpleDateFormat("yyMMddhhmmssMs");
	    String uniqueId = ft.format(dNow);		 
		return uniqueId;
	*/
	}
	
	public static JSONObject toJson(String source)
	{

		JSONParser parser = new JSONParser();
		try {
			JSONObject p = (JSONObject) parser.parse(source);
			return p;
		}
		catch (Exception ex)
		{
			return null;
		}
	}

	public static JSONArray toJsonArray(String source)
	{

		JSONParser parser = new JSONParser();
		try {
			JSONArray p = (JSONArray) parser.parse(source);
			return p;
		}
		catch (Exception ex)
		{
			return null;
		}
	}

	public static JSONArray toJSONArray(String source)
	{
		JSONParser parser = new JSONParser();
		try {
			JSONArray p = (JSONArray) parser.parse(source);
			return p;
		}
		catch (Exception ex)
		{
			return null;
		}
	}
}
