package com.macrosoft.service.bigdataresovler;

import java.io.File;
import java.util.Base64;
import java.util.List;

import org.dom4j.Document;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.bdc.Candb;
import com.macrosoft.model.bdc.Message;
import com.macrosoft.model.bdc.MessageInfo;
import com.macrosoft.model.bdc.Signal;
import com.macrosoft.model.bdc.SignalInfo;
import com.macrosoft.utilities.IcdUtility;
import com.macrosoft.utilities.NumberUtility;
import com.macrosoft.utilities.StringUtility;

public class CanJ1939ModelResolver {
	private static final ILogger logger = LoggerFactory.Create(CanJ1939ModelResolver.class.getName());
	
	public static Candb resolve(String bdcFilePath)
	{
		try {	
			String filePath = bdcFilePath;
			File inputFile = new File(filePath);
	        SAXReader reader = new SAXReader();
	        Document document = reader.read( inputFile );

	        Candb model = new Candb();

	        model.setFileName(document.getRootElement().getName());

	        List<Element> messageElements = document.getRootElement().elements();
	        for (Element messageElement : messageElements)
	        {
	        	 // EQUID element
	        	 Message message = new Message();
	        	 model.getMessages().add(message);
	        	 
	        	 List<Element> messageChildElements = messageElement.elements();
	        	 
	        	 for (Element messageChild : messageChildElements)
	        	 {
	        		if ("name".compareToIgnoreCase(messageChild.getName()) == 0)
	        		{
	        			message.setName(messageChild.getText());
    					continue;
	        		}

	        		if ("id".compareToIgnoreCase(messageChild.getName()) == 0)
	        		{
	        			message.setId(messageChild.getText());
    					continue;
	        		}
	        		if ("dlc".compareToIgnoreCase(messageChild.getName()) == 0)
	        		{
	        			message.setDlc(StringUtility.parseIntegerSafely(messageChild.getText()).getResult());
    					continue;
	        		}

	        		if ("signal".compareToIgnoreCase(messageChild.getName()) == 0)
	        		{
        				Signal signal = new Signal();
        				message.getSignals().add(signal);
        				
	        			List<Element> signalChildElements = messageChild.elements();
	        			for (Element signalChildElement : signalChildElements)
	        			{	        				
	        				if ("name".compareToIgnoreCase(signalChildElement.getName()) == 0)
	    	        		{
	        					signal.setName(signalChildElement.getText());
	        					continue;
	    	        		}

	        				if ("startbit".compareToIgnoreCase(signalChildElement.getName()) == 0)
	    	        		{
	        					signal.setStartbit(StringUtility.parseIntegerSafely(signalChildElement.getText()).getResult());
	        					continue;
	    	        		}

	        				if ("bitlength".compareToIgnoreCase(signalChildElement.getName()) == 0)
	    	        		{
	        					signal.setBitlength(StringUtility.parseIntegerSafely(signalChildElement.getText()).getResult());
	        					continue;
	    	        		}

	        				if ("endianess".compareToIgnoreCase(signalChildElement.getName()) == 0)
	    	        		{
	        					signal.setEndianess(signalChildElement.getText());
	        					continue;
	    	        		}

	        				if ("scaling".compareToIgnoreCase(signalChildElement.getName()) == 0)
	    	        		{
	        					signal.setScaling(StringUtility.parseFloatSafely(signalChildElement.getText()).getResult());
	        					continue;
	    	        		}

	        				if ("offset".compareToIgnoreCase(signalChildElement.getName()) == 0)
	    	        		{
	        					signal.setOffset(StringUtility.parseIntegerSafely(signalChildElement.getText()).getResult());
	        					continue;
	    	        		}

	        				if ("minimum".compareToIgnoreCase(signalChildElement.getName()) == 0)
	    	        		{
	        					signal.setMinimum(StringUtility.parseFloatSafely(signalChildElement.getText()).getResult());
	        					continue;
	    	        		}

	        				if ("maximum".compareToIgnoreCase(signalChildElement.getName()) == 0)
	    	        		{
	        					signal.setMaximum(StringUtility.parseFloatSafely(signalChildElement.getText()).getResult());
	        					continue;
	    	        		}
	        				if ("signed".compareToIgnoreCase(signalChildElement.getName()) == 0)
	    	        		{
	        					signal.setSigned(StringUtility.parseBooleanSafely(signalChildElement.getText()).getResult());
	        					continue;
	    	        		}
	        				if ("floating".compareToIgnoreCase(signalChildElement.getName()) == 0)
	    	        		{
	        					signal.setFloating(StringUtility.parseIntegerSafely(signalChildElement.getText()).getResult());
	        					continue;
	    	        		}
	        				if ("units".compareToIgnoreCase(signalChildElement.getName()) == 0)
	    	        		{
	        					signal.setUnits(signalChildElement.getText());
	        					continue;
	    	        		}
	        			} 	        	 	
	        		}
	        	 }
	         }
	         
	         return model;
		}
		catch(Exception ex)
		{
			logger.error("BdcModelResolver::resolve()", ex);
			return null;
		}
	}
	
	
	public static MessageInfo resolveFrameData(Candb candb, String decodedHexFrameData)
	{
		logger.info("BdcModelResolver::resolveFrameData()->decodedHexFrameData:" + decodedHexFrameData);
		
		MessageInfo messageInfo = new MessageInfo();

		logger.info("BdcModelResolver::resolveFrameData()::decodedHexFrameData is :" + decodedHexFrameData);
		// find can id, 32bit
		String hexCanId = decodedHexFrameData.substring(0, 8);
		String hexDataBytes = decodedHexFrameData.substring(8);

		logger.info("BdcModelResolver::resolveFrameData()->hexCanId:" + hexCanId);
		logger.info("BdcModelResolver::resolveFrameData()->hexDataBytes:" + hexDataBytes);
		
		String canId =  Integer.toString(NumberUtility.hexToDecimal(hexCanId));
		logger.info("BdcModelResolver::resolveFrameData()->canId:" + canId);
		
		
		Message foundMessage = null;
		
		for (Message message : candb.getMessages())
		{
			if (message.getId().compareToIgnoreCase(canId) == 0)
			{
				foundMessage = message;
				break;
			}
		}

		if (foundMessage == null) return null;

		messageInfo.setMessage(foundMessage.getName());
		logger.info("BdcModelResolver::resolveFrameData()->foundMessage:" + foundMessage.getName());
		
		
		String totalValueBits = NumberUtility.hexString2binaryString(hexDataBytes);
		logger.info("BdcModelResolver::resolveFrameData()->totalValueBits:" + totalValueBits);
		
		for (Signal signal : foundMessage.getSignals())
		{
			logger.info("BdcModelResolver::resolveFrameData()->signal:" + signal.getName());
			
			SignalInfo signalInfo = new SignalInfo();
			signalInfo.setName(signal.getName());
			signalInfo.setMaximum(signal.getMaximum());
			signalInfo.setMinimum(signal.getMinimum());			
			

			logger.info(
					String.format("BdcModelResolver::resolveFrameData()->signal:%s, totalValueBits:%s, startbit:%s, bitLength:%s", 
					signal.getName(), totalValueBits, signal.getStartbit(), signal.getBitlength()));
			
			String valueBits = totalValueBits.substring(signal.getStartbit(), signal.getStartbit() + signal.getBitlength());

			long value = NumberUtility.binaryStringToDecimal(valueBits);

			logger.info(
					String.format("BdcModelResolver::resolveFrameData()->signal:%s, valueBits:%s, bitToDecimal:%s", 
					signal.getName(), valueBits, value));
			
			float scaling = signal.getScaling();
			int offset = signal.getOffset();
			
			float floatFinalValue = value * scaling + offset;
			
			String finalValue = "";
			if (signal.getFloating() == 0)
			{
				finalValue = fmtFloat(floatFinalValue);
			}
			else
			{
				finalValue = Float.toString(floatFinalValue);
			}

			if (signal.getUnits() != null)
			{
				finalValue = finalValue + signal.getUnits();
			}
			
			signalInfo.setValue(finalValue);
			
			logger.info(
					String.format("BdcModelResolver::resolveFrameData()->signal:%s, valueBits:%s, value:%s, scaling:%s, offset:%s, finalValue:%s ", 
					signal.getName(), valueBits, value, scaling, offset, finalValue));
			
			messageInfo.getSignals().add(signalInfo);
		}
		
		return messageInfo;
	}
	
    private static String fmtFloat(float d)
	{
	    if(d == (long) d)
	        return String.format("%d",(long)d);
	    else
	        return String.format("%s",d);
	}
}
