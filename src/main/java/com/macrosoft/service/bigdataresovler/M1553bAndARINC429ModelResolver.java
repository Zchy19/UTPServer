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
import com.macrosoft.model.m1553b.ComWord;
import com.macrosoft.model.m1553b.M1553FrameData;
import com.macrosoft.model.m1553ba429.M1553bAndA429FrameComposeInfo;
import com.macrosoft.model.m1553ba429.M1553bAndA429FrameData;
import com.macrosoft.utilities.IcdUtility;
import com.macrosoft.utilities.NumberUtility;
import com.macrosoft.utilities.StringUtility;

public class M1553bAndARINC429ModelResolver {
	private static final ILogger logger = LoggerFactory.Create(M1553bAndARINC429ModelResolver.class.getName());

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

 
	public static M1553bAndA429FrameData resolveFrameData(IcdModel icdModel, String decodedHexFrameData)
	{
		try
		{
			M1553bAndA429FrameData m1553bAndA429FrameData = new M1553bAndA429FrameData();
			m1553bAndA429FrameData.setRawFrame(decodedHexFrameData);
			
			String fullBits = IcdUtility.hexString2binaryString(decodedHexFrameData);			
			logger.info(String.format("M1533b M1553bAndA429FrameData : decodedHexFrameData %s, fullBits:%s", decodedHexFrameData, fullBits));
			
			String rtComBits = fullBits.substring(16);

			String rtValue = fullBits.substring(0, 4 + 1);
			String trValue = fullBits.substring(5, 5 + 1);
			String saValue = fullBits.substring(6, 10 + 1);
			String countValue = fullBits.substring(11, 15 + 1);
			
			logger.info(String.format("rtValue:%s, trValue:%s, saValue:%s, countValue:%s", rtValue, trValue, saValue, countValue));
	
			boolean isBcToRt = false;
			String formatedTrValue = "";
			if ("0".equalsIgnoreCase(trValue))
			{
				isBcToRt = true;
				m1553bAndA429FrameData.setPath("BC to RT");
				formatedTrValue = "R";
			}
			else
			{
				isBcToRt = false;
				m1553bAndA429FrameData.setPath("RT to BC");	
				formatedTrValue = "T";
			}
			
			String rtDecimalValue = IcdUtility.binaryStringToDecimal(rtValue);
			String trDecimalValue = IcdUtility.binaryStringToDecimal(trValue);
			String saDecimalValue = IcdUtility.binaryStringToDecimal(saValue);
			String countDecimalValue = IcdUtility.binaryStringToDecimal(countValue);
			
			m1553bAndA429FrameData.setComWord(String.format("%s-%s-%s-%s", rtDecimalValue,formatedTrValue,saDecimalValue, countDecimalValue));

			logger.info(String.format("M1553bAndA429FrameData ComWord: %s", m1553bAndA429FrameData.getComWord()));

			
			//int rtComKey = StringUtility.parseIntegerSafely(trDecimalValue).getResult();
			//if (m1553bModel.getRtComs().containsKey(rtComKey))
			{
				//RtCom rtCom = m1553bModel.getRtComs().get(rtComKey);
				int count = StringUtility.parseIntegerSafely(countDecimalValue).getResult();
				
				if (isBcToRt)
				{
					String statusData = rtComBits.substring(0, 16);
					m1553bAndA429FrameData.setStatus(IcdUtility.binaryString2HexString(statusData));

					logger.info(String.format("M1553bAndA429FrameData status: %s", m1553bAndA429FrameData.getStatus()));

					
					//while (count > 0)
					{
						String data = rtComBits.substring(0, 32);
						rtComBits = rtComBits.substring(32);

						logger.info(String.format("M1553bAndA429FrameData decodedHexFrameData: %s", IcdUtility.binaryString2HexString(data)));

						ARINC429FrameData a429FrameData = ARINC429ModelResolver.resolveFrameData(icdModel, IcdUtility.addZeroHeader(IcdUtility.binaryString2HexString(data), 8));
						m1553bAndA429FrameData.getFrameDatas().add(a429FrameData);
					
						//count = count - 2;
					}
				}
				else
				{
					//while (count > 0)
					{
						String data = rtComBits.substring(0, 32);
						rtComBits = rtComBits.substring(32);

						logger.info(String.format("M1553bAndA429FrameData decodedHexFrameData: %s", IcdUtility.binaryString2HexString(data)));

						ARINC429FrameData a429FrameData = ARINC429ModelResolver.resolveFrameData(icdModel, IcdUtility.addZeroHeader(IcdUtility.binaryString2HexString(data), 8));
						m1553bAndA429FrameData.getFrameDatas().add(a429FrameData);
					}
					
					
					String statusData = rtComBits.substring(0, 16);
					rtComBits = rtComBits.substring(16);
					m1553bAndA429FrameData.setStatus(IcdUtility.binaryString2HexString(statusData));
				}				
			}
			
			return m1553bAndA429FrameData;
		}
		catch(Exception ex)
		{
			logger.error("M1553bAndA429FrameData - > resolveFrameData ", ex);
			return null;
		}
	}

	public static String composeFrame(IcdModel icdModel, M1553bAndA429FrameComposeInfo composeInfo)
	{
		String sequencedFrame = "00000000000000000000000000000000";
		
		String lableIndex = composeInfo.getLableIndex();
		
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
					for (IcdInputFrameFieldInfo icdInputFrameFieldInfo: composeInfo.getFields())
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
								if ("0".equalsIgnoreCase(composeInfo.getSsmCode()))
								{
									sequencedFrame = IcdUtility.updateFrame(sequencedFrame, field.getStartBit() -1, "00");
								}
								if ("1".equalsIgnoreCase(composeInfo.getSsmCode()))
								{
									sequencedFrame = IcdUtility.updateFrame(sequencedFrame, field.getStartBit()  -1, "10");
								}
								if ("2".equalsIgnoreCase(composeInfo.getSsmCode()))
								{
									sequencedFrame = IcdUtility.updateFrame(sequencedFrame, field.getStartBit()  -1, "01");
								}
								if ("3".equalsIgnoreCase(composeInfo.getSsmCode()))
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

		//hexFrame = IcdUtility.addZeroHeader(composeInfo.getComWordHex(), 4) + hexFrame;
		hexFrame = "1024" + hexFrame;
		logger.info(String.format("composed comWordHex:%s", hexFrame));

		return hexFrame;
	}
	
}
