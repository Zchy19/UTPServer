package com.macrosoft.service.bigdataresovler;

import java.io.File;
import java.util.List;

import org.dom4j.Document;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.genericbusFrame.CheckSumField;
import com.macrosoft.model.genericbusFrame.CommandFieldInfo;
import com.macrosoft.model.genericbusFrame.EndFlagField;
import com.macrosoft.model.genericbusFrame.Field;
import com.macrosoft.model.genericbusFrame.FieldInfo;
import com.macrosoft.model.genericbusFrame.InputFrameFieldInfo;
import com.macrosoft.model.genericbusFrame.InputFrameInfo;
import com.macrosoft.model.genericbusFrame.Message;
import com.macrosoft.model.genericbusFrame.MessageInfo;
import com.macrosoft.model.genericbusFrame.MessageTable;
import com.macrosoft.model.genericbusFrame.StartFlagField;
import com.macrosoft.utilities.IcdUtility;
import com.macrosoft.utilities.NumberUtility;
import com.macrosoft.utilities.StringUtility;

public class GenericBusFrameModelResolver {
	private static final ILogger logger = LoggerFactory.Create(GenericBusFrameModelResolver.class.getName());

	public static MessageTable resolve(String filePath) {
		try {
			
			MessageTable model = null;
			File inputFile = new File(filePath);
			SAXReader reader = new SAXReader();
			Document document = reader.read(inputFile);

			model = new MessageTable();
			model.setName(document.getRootElement().attributeValue("name"));
			model.setEndianess(document.getRootElement().attributeValue("endianess"));

			List<Element> messageElements = document.getRootElement().elements();
			for (Element messageElement : messageElements) {
				// EQUID element
				Message message = new Message();
				model.getMessages().add(message);
				
				message.setName(messageElement.attributeValue("name"));
				
				List<Element> messageChildElements = messageElement.elements();
				for (Element messageChildElement : messageChildElements) {
					
					if (messageChildElement.getName().compareToIgnoreCase("startFlagField") == 0)
					{
						Element startFlagFieldElement = messageChildElement;
						StartFlagField startFlagField = new StartFlagField();
						message.setStartFlagField(startFlagField);
						
						List<Element> startFlagFieldChildElements = startFlagFieldElement.elements();
						for (Element fieldChildElement: startFlagFieldChildElements)
						{
							if (fieldChildElement.getName().compareToIgnoreCase("value") == 0)
							{
								startFlagField.setId(fieldChildElement.getStringValue());
							}
							if (fieldChildElement.getName().compareToIgnoreCase("name") == 0)
							{
								startFlagField.setName(fieldChildElement.getStringValue());
							}
							if (fieldChildElement.getName().compareToIgnoreCase("startbit") == 0)
							{
								startFlagField.setStartbit(StringUtility.parseIntegerSafely(fieldChildElement.getStringValue()).getResult());
							}
							if (fieldChildElement.getName().compareToIgnoreCase("bitlength") == 0)
							{
								startFlagField.setBitlength(StringUtility.parseIntegerSafely(fieldChildElement.getStringValue()).getResult());
							}
						}
						
					}

					if (messageChildElement.getName().compareToIgnoreCase("endFlagField") == 0)
					{
						Element endFlagFieldElement = messageChildElement;
						EndFlagField endFlagField = new EndFlagField();
						message.setEndFlagField(endFlagField);
						
						List<Element> endFlagFieldChildElements = endFlagFieldElement.elements();
						for (Element fieldChildElement: endFlagFieldChildElements)
						{
							if (fieldChildElement.getName().compareToIgnoreCase("value") == 0)
							{
								endFlagField.setId(fieldChildElement.getStringValue());
							}
							if (fieldChildElement.getName().compareToIgnoreCase("name") == 0)
							{
								endFlagField.setName(fieldChildElement.getStringValue());
							}
							if (fieldChildElement.getName().compareToIgnoreCase("startbit") == 0)
							{
								endFlagField.setStartbit(StringUtility.parseIntegerSafely(fieldChildElement.getStringValue()).getResult());
							}
							if (fieldChildElement.getName().compareToIgnoreCase("bitlength") == 0)
							{
								endFlagField.setBitlength(StringUtility.parseIntegerSafely(fieldChildElement.getStringValue()).getResult());
							}
						}
					}
					 

					if (messageChildElement.getName().compareToIgnoreCase("checksumField") == 0)
					{
						Element checksumFieldElement = messageChildElement;
						CheckSumField checksumField = new CheckSumField();
						message.setChecksumField(checksumField);
						
						List<Element> checksumFieldChildElements = checksumFieldElement.elements();
						for (Element fieldChildElement: checksumFieldChildElements)
						{
							if (fieldChildElement.getName().compareToIgnoreCase("startbit") == 0)
							{
								checksumField.setStartbit(StringUtility.parseIntegerSafely(fieldChildElement.getStringValue()).getResult());
							}
							if (fieldChildElement.getName().compareToIgnoreCase("bitlength") == 0)
							{
								checksumField.setBitlength(StringUtility.parseIntegerSafely(fieldChildElement.getStringValue()).getResult());
							}
						}
					}
					 
					
					if (messageChildElement.getName().compareToIgnoreCase("field") == 0)
					{
						Element fieldElement = messageChildElement;
						Field field = new Field();
						message.getFields().add(field);
						
						List<Element> fieldChildElements = fieldElement.elements();
						for (Element fieldChildElement: fieldChildElements)
						{
							if (fieldChildElement.getName().compareToIgnoreCase("name") == 0)
							{
								field.setName(fieldChildElement.getStringValue());
							}
							if (fieldChildElement.getName().compareToIgnoreCase("type") == 0)
							{
								field.setType(fieldChildElement.getStringValue());
							}
							if (fieldChildElement.getName().compareToIgnoreCase("startbit") == 0)
							{
								field.setStartbit(StringUtility.parseIntegerSafely(fieldChildElement.getStringValue()).getResult());
							}
							if (fieldChildElement.getName().compareToIgnoreCase("bitlength") == 0)
							{
								field.setBitlength(StringUtility.parseIntegerSafely(fieldChildElement.getStringValue()).getResult());
							}
							if (fieldChildElement.getName().compareToIgnoreCase("maximum") == 0)
							{
								field.setMaximum(fieldChildElement.getStringValue());
							}
							if (fieldChildElement.getName().compareToIgnoreCase("minimum") == 0)
							{
								field.setMinimum(fieldChildElement.getStringValue());
							}
							if (fieldChildElement.getName().compareToIgnoreCase("codeType") == 0)
							{
								field.setCodeType(fieldChildElement.getStringValue());
							}
							if (fieldChildElement.getName().compareToIgnoreCase("units") == 0)
							{
								field.setUnits(fieldChildElement.getStringValue());
							}

							if (fieldChildElement.getName().compareToIgnoreCase("precision") == 0)
							{
								field.setPrecision(StringUtility.parseIntegerSafely(fieldChildElement.getStringValue()).getResult());
							}

							if (fieldChildElement.getName().compareToIgnoreCase("scale") == 0)
							{
								field.setScale(StringUtility.parseFloatSafely(fieldChildElement.getStringValue()).getResult());
							}
							if (fieldChildElement.getName().compareToIgnoreCase("default") == 0)
							{
								field.setDefaultValue(fieldChildElement.getStringValue());
							}
						}
					}
				}
			}

			return model;
		} catch (Exception ex) {

			logger.info("GenericBusFrameModelResolver::resolve()->has exception:" + ex);
			return null;
		}
	}


	
	public static MessageInfo resolveFrameData(MessageTable messageTable, String decodedHexFrameData)
	{
		logger.info("GenericBusFrameModelResolver::resolveFrameData()->decodedHexFrameData:" + decodedHexFrameData);
		
		MessageInfo messageInfo = new MessageInfo();

		// find id, 32bit
		String totalFrameBits = NumberUtility.hexString2binaryString(decodedHexFrameData);

		logger.info(String.format("GenericBusFrameModelResolver::resolveFrameData()->length: %s, totalFrameBits:%s", totalFrameBits.length(), totalFrameBits));
		
		String id = "";
		Message foundMessage = null;
		
		for (Message message : messageTable.getMessages())
		{
			StartFlagField startFlagField = message.getStartFlagField();
			String idBits = totalFrameBits.substring(startFlagField.getStartbit(), startFlagField.getStartbit() + startFlagField.getBitlength());
			logger.info("GenericBusFrameModelResolver::resolveFrameData()->idBits:" + idBits);
			id = Long.toString(NumberUtility.binaryStringToDecimal(idBits));
			
			if (message.getStartFlagField().getId().compareToIgnoreCase(id) == 0)
			{
				logger.info("GenericBusFrameModelResolver::resolveFrameData()->found startFlagField value:" + startFlagField.getId());
				foundMessage = message;
				break;
			}
		}

		if (foundMessage == null) return null;

		messageInfo.setMessage(foundMessage.getName());
		logger.info("GenericBusFrameModelResolver::resolveFrameData()->foundMessage:" + foundMessage.getName());
		
		CommandFieldInfo commandFieldInfo = new CommandFieldInfo();
		commandFieldInfo.setId(id);
		commandFieldInfo.setName(foundMessage.getName());
		
		messageInfo.setCommandField(commandFieldInfo);
		

		logger.info("GenericBusFrameModelResolver::resolveFrameData()->totalFrameBits:" + totalFrameBits);
		
		for (Field field : foundMessage.getFields())
		{
			logger.info("GenericBusFrameModelResolver::resolveFrameData()->field:" + field.getName());
			
			FieldInfo fieldInfo = new FieldInfo();
			fieldInfo.setName(field.getName());	
			fieldInfo.setUnits(field.getUnits());			
			

			logger.info(
					String.format("GenericBusFrameModelResolver::resolveFrameData()->fieldName:%s, totalValueBits:%s, startbit:%s, bitLength:%s", 
					field.getName(), totalFrameBits, field.getStartbit(), field.getBitlength()));
			
			String valueBits = totalFrameBits.substring(field.getStartbit(), field.getStartbit() + field.getBitlength());

			if (Field.Type_Integer.compareToIgnoreCase(field.getType()) == 0
					|| Field.Type_Float.compareToIgnoreCase(field.getType()) == 0)
			{
				long value = NumberUtility.binaryStringToDecimal(valueBits);

				logger.info(
						String.format("GenericBusFrameModelResolver::resolveFrameData()->fieldName:%s, valueBits:%s, bitToDecimal:%s", 
						field.getName(), valueBits, value));
				
				float floatFinalValue = value;
				
				String finalValue = fmtFloat(floatFinalValue);
				int valueLength = finalValue.length();

				int digits = field.getPrecision();

				logger.info(
						String.format("GenericBusFrameModelResolver::resolveFrameData()->fieldName:%s, valueLength:%s, digits:%s", 
						field.getName(), valueLength, digits));
				
				
				if (digits > 0)
				{
					String integerPart = finalValue.substring(0, valueLength - digits);
					if (integerPart.length() == 0)
					{
						integerPart = "0";
					}
					
					finalValue = integerPart + "." + finalValue.substring(valueLength - digits, valueLength);	
				}
				
				fieldInfo.setValue(finalValue);
				
				logger.info(
						String.format("GenericBusFrameModelResolver::resolveFrameData()->fieldName:%s, valueBits:%s, value:%s,  finalValue:%s ", 
								field.getName(), valueBits, value, finalValue));
				
				messageInfo.getFields().add(fieldInfo);
				
			}
			else if (Field.Type_Bits.compareToIgnoreCase(field.getType()) == 0)
			{
				String finalValue = valueBits;

				fieldInfo.setValue(finalValue);

				logger.info(
						String.format("GenericBusFrameModelResolver::resolveFrameData()->fieldName:%s, valueBits:%s, value:%s,  finalValue:%s ", 
								field.getName(), valueBits, finalValue, finalValue));
				
				messageInfo.getFields().add(fieldInfo);
			}
			
		}
		
		return messageInfo;
	}
	

	public static String composeFrame(MessageTable messageTable, InputFrameInfo frameInfo)
	{

		String id = frameInfo.getId();
		String startFlagFieldIdBits = "";


		String dataBits = "";
		int modNumberOfBits = 8;
		
		for (Message message : messageTable.getMessages())
		{
			StartFlagField startFlagField = message.getStartFlagField();
			if (id.compareToIgnoreCase(startFlagField.getId()) == 0)
			{
				
				/*
				Field biggestStartBitField = null;
				for (Field field : message.getFields())
				{
					if (biggestStartBitField == null || biggestStartBitField.getStartbit() < field.getStartbit())
					{
						biggestStartBitField = field;
					}
				}
				
				int frameBitTotalLength = biggestStartBitField.getStartbit() + biggestStartBitField.getBitlength();
				*/
				int frameBitTotalLength = message.getEndFlagField().getStartbit() + message.getEndFlagField().getBitlength();
				
				if (frameBitTotalLength % modNumberOfBits != 0)
				{
					frameBitTotalLength = frameBitTotalLength + (modNumberOfBits - frameBitTotalLength % modNumberOfBits);
				}
				
				dataBits = IcdUtility.addZeroHeader(dataBits, frameBitTotalLength);

				// update startFlagField bits
				startFlagFieldIdBits = IcdUtility.addZeroHeader(IcdUtility.DecimalToBinaryString(StringUtility.parseIntegerSafely(startFlagField.getId()).getResult()), startFlagField.getBitlength());
				dataBits = IcdUtility.updateFrame(dataBits, startFlagField.getStartbit(), startFlagFieldIdBits);
				logger.info(String.format("fieldName:%s, length: %s, idFieldBits: %s", message.getName(), frameBitTotalLength, startFlagFieldIdBits));
				logger.info(String.format("fieldName:%s, length: %s, dataBits: %s", message.getName(), frameBitTotalLength, dataBits));
				
				
				// update endFlagField bits
				EndFlagField endFlagField = message.getEndFlagField();				
				String endFlagFieldIdBits = IcdUtility.addZeroHeader(IcdUtility.DecimalToBinaryString(StringUtility.parseIntegerSafely(endFlagField.getId()).getResult()), endFlagField.getBitlength());
				dataBits = IcdUtility.updateFrame(dataBits, endFlagField.getStartbit(), endFlagFieldIdBits);
				logger.info(String.format("fieldName:%s, length: %s, endFlagFieldIdBits: %s", message.getName(), frameBitTotalLength, endFlagFieldIdBits));
				logger.info(String.format("fieldName:%s, length: %s, dataBits: %s", message.getName(), frameBitTotalLength, dataBits));
				
				
				for (InputFrameFieldInfo fieldInfo : frameInfo.getFields())
				{
					for (Field field : message.getFields())
					{
						if (field == null) continue;
						
						if (field.getName().compareToIgnoreCase(fieldInfo.getFieldName()) == 0)
						{
							if (Field.Type_Bits.compareToIgnoreCase(field.getType()) == 0)
							{
								String valueBits = IcdUtility.addZeroHeader(fieldInfo.getValue(), field.getBitlength());

								logger.info(String.format("fieldName:%s, valueBits: %s", field.getName(), valueBits));
								// update value field bits
								dataBits = IcdUtility.updateFrame(dataBits, field.getStartbit(), valueBits);

								logger.info(String.format("fieldName:%s, dataBits: %s", field.getName(), dataBits));
							}
							else if (Field.Type_Integer.compareToIgnoreCase(field.getType()) == 0
									|| Field.Type_Float.compareToIgnoreCase(field.getType()) == 0)
							{
								String bcdValue = fieldInfo.getValue();

								logger.info(String.format("fieldName:%s, value: %s", field.getName(), bcdValue));
								
								bcdValue = Float.toString(StringUtility.parseFloatSafely(bcdValue).getResult() * field.getScale());
								
								logger.info(String.format("fieldName:%s, value with scale: %s", field.getName(), bcdValue));
								
								int startBit = field.getStartbit();
								
								int digits = field.getPrecision(); //IcdUtility.getLengthOfDigits(field.getMaximum());

								logger.info(String.format("fieldName:%s, digits : %s", field.getName(), digits ));
								
								while(digits >0)
								{
									bcdValue = Float.toString(StringUtility.parseFloatSafely(bcdValue).getResult() * 10);
									digits = digits -1;
								}
								
								logger.info(String.format("fieldName:%s, bcdValue : %s", field.getName(), bcdValue));
								
								
								bcdValue = IcdUtility.removeDigits(bcdValue);

								logger.info(String.format("fieldName:%s, removed Ditits bcdValue : %s", field.getName(), bcdValue));
								
								
								String valueBits = IcdUtility.addZeroHeader(IcdUtility.DecimalToBinaryString(StringUtility.parseIntegerSafely(bcdValue).getResult()), field.getBitlength());	
								
								logger.info(String.format("fieldName:%s, valueBits : %s", field.getName(), valueBits));

								// update value field bits
								dataBits = IcdUtility.updateFrame(dataBits, startBit, valueBits);
							}
	
						}
					}

					logger.info(String.format("fieldName:%s, length: %s, dataBits: %s", message.getName(), frameBitTotalLength, dataBits));
				}
			}
		}

		/*
		// make up 0 at the end for 4 bit multiple
		if (dataBits.length() % 4 != 0)
		{
			int fullLength = dataBits.length() + (4 - (dataBits.length() % 4));
			dataBits = IcdUtility.addZeroTail(dataBits, fullLength);
		}

		
*/
		int modForHex = dataBits.length() / 4;
		String dataBitsHexFrame = IcdUtility.longBinaryString2HexString(dataBits);

		logger.info(String.format("dataBitsHexFrame:%s, modForHex: %s", dataBitsHexFrame, modForHex));
		
		dataBitsHexFrame = IcdUtility.addZeroHeader(dataBitsHexFrame, modForHex);
		
		logger.info(String.format("hexFrame:%s", dataBitsHexFrame));

		return dataBitsHexFrame;
	}
	
    private static String fmtFloat(float d)
	{
	    if(d == (long) d)
	        return String.format("%d",(long)d);
	    else
	        return String.format("%s",d);
	}
}
