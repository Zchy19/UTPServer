package com.macrosoft.service.bigdataresovler;

import java.io.File;
import java.util.ArrayList;
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
import com.macrosoft.model.idc.BCD;
import com.macrosoft.model.idc.Code;
import com.macrosoft.model.idc.CodeField;
import com.macrosoft.model.idc.Equipment;
import com.macrosoft.model.idc.Field;
import com.macrosoft.model.idc.ARINC429FrameData;
import com.macrosoft.model.idc.ARINC429FrameFieldData;
import com.macrosoft.model.idc.IcdInputFrameFieldInfo;
import com.macrosoft.model.idc.IcdInputFrameInfo;
import com.macrosoft.model.idc.IcdModel;
import com.macrosoft.model.idc.Label;
import com.macrosoft.utilities.IcdUtility;
import com.macrosoft.utilities.NumberUtility;
import com.macrosoft.utilities.StringUtility;

public class ARINC429ModelResolver {
	private static final ILogger logger = LoggerFactory.Create(ARINC429ModelResolver.class.getName());

	public static IcdModel resolve(String filePath) {
		try {
			IcdModel model = null;
			File inputFile = new File(filePath);
			SAXReader reader = new SAXReader();
			Document document = reader.read(inputFile);

			model = new IcdModel();
			model.setId(inputFile.getName());
			model.setName(document.getRootElement().getName());
			model.setVersion(document.getRootElement().attributeValue("Ant_Version"));
			model.setEquipments(new ArrayList<Equipment>());

			List<Element> equipElements = document.getRootElement().elements();
			for (Element equipElement : equipElements) {
				// EQUID element
				Equipment equip = new Equipment();

				equip.setIndex(equipElement.attributeValue("Index"));
				equip.setName(equipElement.attributeValue("Name"));

				equip.setLabels(new ArrayList<Label>());
				model.getEquipments().add(equip);

				List<Element> labelElements = equipElement.elements();
				for (Element labelElement : labelElements) {
					Label label = new Label();
					label.setIndex(labelElement.attributeValue("Index"));
					label.setName(labelElement.attributeValue("Name"));
					label.setMaxTxInterval(Float.parseFloat(labelElement.attributeValue("MaxTxInterval")));
					label.setMinTxInterval(Float.parseFloat(labelElement.attributeValue("MinTxInterval")));

					label.setFields(new ArrayList<Field>());

					List<Element> fieldElements = labelElement.elements();

					for (Element fieldElement : fieldElements) {
						Field field = new Field();
						field.setName(fieldElement.attributeValue("Name"));
						field.setUnit(fieldElement.attributeValue("Units"));
						field.setStartBit(Integer.parseInt(fieldElement.attributeValue("StartBit")));
						field.setEndBit(Integer.parseInt(fieldElement.attributeValue("EndBit")));

						label.getFields().add(field);

						if ("SSM".compareToIgnoreCase(fieldElement.attributeValue("Name")) == 0) {
							CodeField codeField = new CodeField();

							List<Element> codedFieldElements = fieldElement.elements();
							for (Element codeFieldElement : codedFieldElements) {
								List<Element> codeElements = codeFieldElement.elements();
								for (Element codeElement : codeElements) {
									Code code = new Code();
									code.setString(codeElement.attributeValue("String"));
									code.setValue(codeElement.attributeValue("value"));

									codeField.getCodes().add(code);
								}
							}

							field.setCodeField(codeField);
						} else {
							List<Element> bcdElements = fieldElement.elements();
							for (Element bcdElement : bcdElements) {
								BCD bcd = new BCD();
								bcd.setDigit_Size(Integer.parseInt(bcdElement.attributeValue("Digit_Size")));
								bcd.setDigits(Integer.parseInt(bcdElement.attributeValue("Digits")));
								bcd.setMSD_Size(Integer.parseInt(bcdElement.attributeValue("MSD_Size")));
								bcd.setMaxva1(bcdElement.attributeValue("Maxva1"));
								bcd.setMinva1(bcdElement.attributeValue("Minva1"));

								field.setBcd(bcd);
							}
						}
					}

					equip.getLabels().add(label);
				}
			}

			return model;
		} catch (Exception ex) {
			return null;
		}
	}

 
	public static ARINC429FrameData resolveFrameData(IcdModel icdModel, String decodedHexFrameData)
	{
		try
		{
			String full32Bits = IcdUtility.hexString2binaryString(decodedHexFrameData);
			String labelIndex = IcdUtility.resolveLableIndex(full32Bits);
			List<ARINC429FrameFieldData> fields = new ArrayList<ARINC429FrameFieldData>();
			
			for (Equipment equip : icdModel.getEquipments())
			{
				for (Label label : equip.getLabels())
				{
					if (labelIndex.compareToIgnoreCase(label.getIndex()) != 0) continue;
					
					ARINC429FrameData frameData = new ARINC429FrameData();
					frameData.setLabelIndex(labelIndex);
					
					frameData.setLabelName(label.getName());
					frameData.setDecodedBits(full32Bits);
					frameData.setEncodedString(decodedHexFrameData);
					frameData.setFields(fields);
					
					for (Field field: label.getFields())
					{
						if ("SSM".compareToIgnoreCase(field.getName()) == 0)
						{
							String ssmValue = IcdUtility.resolveSsm(full32Bits, field.getStartBit(), field.getEndBit());
							CodeField codeField = field.getCodeField();
							for (Code code : codeField.getCodes())
							{
								if (code.getValue().compareToIgnoreCase(ssmValue) == 0)
								{
									frameData.setSsmValue(code.getString());
									break;
								}
							}
						}
						else
						{
							// todo: parse multiple field by frame.
							
							BCD bcdField = field.getBcd();	
							
							
							String bcdValue = IcdUtility.resolveDigitalBits(full32Bits, field.getStartBit(), field.getEndBit(), bcdField.getDigits(), bcdField.getDigit_Size());

							double bcd = Double.parseDouble(bcdValue);

							int precisionDigits = IcdUtility.getNumberDecimalDigits(bcdField.getMaxva1());
							
							ARINC429FrameFieldData fieldData = new ARINC429FrameFieldData();
							fieldData.setBcdValue(IcdUtility.formatBcdValue(bcdValue, precisionDigits));
							fieldData.setUnits(field.getUnit());
							fieldData.setFieldName(field.getName());
							
							fields.add(fieldData);
							
						}
					}
					
					return frameData;

				}
			}
			
			logger.info(String.format("can not resolve frame for labelIndex : %s in icdmodel:%s", labelIndex, icdModel.getName()));
			return null;
		}
		catch(Exception ex)
		{
			logger.error("resolveFrameData", ex);
			return null;
		}
	}

	public static String composeFrame(IcdModel icdModel, IcdInputFrameInfo frameInfo)
	{
		String sequencedFrame = "00000000000000000000000000000000";
		
		String lableIndex = frameInfo.getLableIndex();
		
		String label1 = lableIndex.substring(0, 1);
		String label2 = lableIndex.substring(1, 2);
		String label3 = lableIndex.substring(2, 3);
		
		String label1BinaryString = IcdUtility.addZeroHeader(IcdUtility.DecimalToBinaryString(StringUtility.parseIntegerSafely(label1).getResult()), 2);
		String label2BinaryString = IcdUtility.addZeroHeader(IcdUtility.DecimalToBinaryString(StringUtility.parseIntegerSafely(label2).getResult()), 3);
		String label3BinaryString = IcdUtility.addZeroHeader(IcdUtility.DecimalToBinaryString(StringUtility.parseIntegerSafely(label3).getResult()), 3);
		
		
		sequencedFrame = IcdUtility.updateFrame(sequencedFrame, 0, label1BinaryString);		
		sequencedFrame = IcdUtility.updateFrame(sequencedFrame, 2, label2BinaryString);
		sequencedFrame = IcdUtility.updateFrame(sequencedFrame, 5, label3BinaryString);
		
		
		for (Equipment equipment : icdModel.getEquipments())
		{
			for (Label label : equipment.getLabels())
			{
				if (lableIndex.equalsIgnoreCase(label.getIndex()))
				{
					for (IcdInputFrameFieldInfo icdInputFrameFieldInfo: frameInfo.getFields())
					{
						for (Field field: label.getFields())
						{
							if (field.getName().equalsIgnoreCase(icdInputFrameFieldInfo.getFieldName()))
							{
								String bcdValue = icdInputFrameFieldInfo.getBcdValue();
							
								int startBit = field.getEndBit();
								
								int digits = IcdUtility.getLengthOfDigits(field.getBcd().getMaxva1());
								
								while(digits >0)
								{
									bcdValue = Float.toString(StringUtility.parseFloatSafely(bcdValue).getResult() * 10);
									digits = digits -1;
								}
								
								bcdValue = IcdUtility.removeDigits(bcdValue);
					
								while (bcdValue.length() > 0)
								{
									String number = IcdUtility.getLastChar(bcdValue);
									bcdValue = bcdValue.substring(0, bcdValue.length()-1);

									String bits = IcdUtility.addZeroHeader(IcdUtility.DecimalToBinaryString(StringUtility.parseIntegerSafely(number).getResult()), field.getBcd().getDigit_Size());									
									String reversedBits = IcdUtility.reverseString(bits);

									sequencedFrame = IcdUtility.updateFrame(sequencedFrame, startBit-1, reversedBits);	

									startBit = startBit + field.getBcd().getDigit_Size();
								}	
							}
							
							if ("SSM".equalsIgnoreCase(field.getName()))
							{
								if ("0".equalsIgnoreCase(frameInfo.getSsmCode()))
								{
									sequencedFrame = IcdUtility.updateFrame(sequencedFrame, field.getStartBit() -1, "00");
								}
								if ("1".equalsIgnoreCase(frameInfo.getSsmCode()))
								{
									sequencedFrame = IcdUtility.updateFrame(sequencedFrame, field.getStartBit()  -1, "10");
								}
								if ("2".equalsIgnoreCase(frameInfo.getSsmCode()))
								{
									sequencedFrame = IcdUtility.updateFrame(sequencedFrame, field.getStartBit()  -1, "01");
								}
								if ("3".equalsIgnoreCase(frameInfo.getSsmCode()))
								{
									sequencedFrame = IcdUtility.updateFrame(sequencedFrame, field.getStartBit()  -1, "11");
								}
							}
			
						}
						
					}
					
				}
			}
			
			
		}

		
		String reversedSequencedFrame = IcdUtility.reverseString(sequencedFrame);
		
		String hexFrame = IcdUtility.binaryString2HexString(reversedSequencedFrame);

		hexFrame = IcdUtility.addZeroHeader(hexFrame, 8);
		logger.info(String.format("sequencedFrame:%s, reversedSequencedFrame: %s, hexFrame:%s", sequencedFrame, reversedSequencedFrame, hexFrame));

		return hexFrame;
	}
	
}
