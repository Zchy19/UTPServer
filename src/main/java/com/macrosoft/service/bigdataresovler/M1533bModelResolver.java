package com.macrosoft.service.bigdataresovler;

import java.io.File;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.poi.util.StringUtil;
import org.dom4j.Document;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.m1553b.*;
import com.macrosoft.utilities.IcdUtility;
import com.macrosoft.utilities.NumberUtility;
import com.macrosoft.utilities.StringUtility;

public class M1533bModelResolver {
	private static final ILogger logger = LoggerFactory.Create(M1533bModelResolver.class.getName());

	public static M1553bModel resolve(String filePath) {
		try {
			M1553bModel model = null;
			File inputFile = new File(filePath);
			SAXReader reader = new SAXReader();
			Document document = reader.read(inputFile);

			model = new M1553bModel();
			model.setId(inputFile.getName());
			model.setName(document.getRootElement().getName());
			
			//model.setVersion(document.getRootElement().attributeValue("Ant_Version"));
			
			List<Element> subElementsOfM1553 = document.getRootElement().elements();
			
			for (Element subElementOfM1553 : subElementsOfM1553) {
				// com word element
				if (subElementOfM1553.getName().equalsIgnoreCase("COMWORD"))
				{
					ComWord comWord = new ComWord();
					model.setComWord(comWord);

					List<Element> subElementsOfComWordElement = subElementOfM1553.elements();					
					for (Element subElementOfComWordElement : subElementsOfComWordElement) {

						Field field = new Field();
						field.setStartBit(StringUtility.parseIntegerSafely(subElementOfComWordElement.attributeValue("StartBit")).getResult());
						field.setEndBit(StringUtility.parseIntegerSafely(subElementOfComWordElement.attributeValue("EndBit")).getResult());

						if ("RT".equalsIgnoreCase(subElementOfComWordElement.attributeValue("Name")))
						{
							comWord.setRtField(field);
						}
						if ("T/R".equalsIgnoreCase(subElementOfComWordElement.attributeValue("Name")))
						{
							comWord.setTrField(field);
						}
						if ("SA".equalsIgnoreCase(subElementOfComWordElement.attributeValue("Name")))
						{
							comWord.setSaField(field);
						}
						if ("COUNT".equalsIgnoreCase(subElementOfComWordElement.attributeValue("Name")))
						{
							comWord.setCountField(field);
						}
					}
				}
				
				if (subElementOfM1553.getName().equalsIgnoreCase("RT_COM"))
				{
					ConcurrentHashMap<Integer, RtCom> rtComHashMap = model.getRtComs();
					RtCom rtCom = new RtCom();
					
					int rtMode = StringUtility.parseIntegerSafely(subElementOfM1553.attributeValue("rt_mode")).getResult();
					
					List<Element> subElementsOfRtCom = subElementOfM1553.elements();				
					for (Element subElementOfRtCom : subElementsOfRtCom) {
						Element idElement = subElementOfRtCom;

						int index = StringUtility.parseIntegerSafely(idElement.attributeValue("index")).getResult();
				
						rtComHashMap.put(index, rtCom);
						
						List<Element> subElementsOfId = idElement.elements();							
						for (Element subElementOfId : subElementsOfId) {

							Field field = new Field();
							field.setIndex(index);
							field.setStartBit(StringUtility.parseIntegerSafely(subElementOfId.attributeValue("StartBit")).getResult());
							field.setEndBit(StringUtility.parseIntegerSafely(subElementOfId.attributeValue("EndBit")).getResult());

							field.setName(subElementOfId.attributeValue("Name"));
						}
					}
				}
			}

			return model;
		} catch (Exception ex) {
			return null;
		}
	}

 
	public static M1553FrameData resolveFrameData(M1553bModel m1553bModel, String decodedHexFrameData)
	{
		try
		{
			M1553FrameData frameData = new M1553FrameData();
			frameData.setRawFrame(decodedHexFrameData);
			
			String full32Bits = IcdUtility.hexString2binaryString(decodedHexFrameData);			
			logger.info(String.format("M1533b resolveFrameData : decodedHexFrameData %s, full32Bits:%s", decodedHexFrameData, full32Bits));
			
			String rtComBits = full32Bits.substring(16);

			ComWord comword = m1553bModel.getComWord();
			String rtValue = full32Bits.substring(comword.getRtField().getStartBit(), comword.getRtField().getEndBit() + 1);
			String trValue = full32Bits.substring(comword.getTrField().getStartBit(), comword.getTrField().getEndBit() + 1);
			String saValue = full32Bits.substring(comword.getSaField().getStartBit(), comword.getSaField().getEndBit() + 1);
			String countValue = full32Bits.substring(comword.getCountField().getStartBit(), comword.getCountField().getEndBit() + 1);
			
			logger.info(String.format("rtValue:%s, trValue:%s, saValue:%s, countValue:%s", rtValue, trValue, saValue, countValue));
	
			boolean isBcToRt = false;
			String formatedTrValue = "";
			if ("0".equalsIgnoreCase(trValue))
			{
				isBcToRt = true;
				frameData.setPath("BC to RT");
				formatedTrValue = "R";
			}
			else
			{
				isBcToRt = false;
				frameData.setPath("RT to BC");	
				formatedTrValue = "T";
			}
			
			String rtDecimalValue = IcdUtility.binaryStringToDecimal(rtValue);
			String trDecimalValue = IcdUtility.binaryStringToDecimal(trValue);
			String saDecimalValue = IcdUtility.binaryStringToDecimal(saValue);
			String countDecimalValue = IcdUtility.binaryStringToDecimal(countValue);
			
			frameData.setComWord(String.format("%s-%s-%s-%s", rtDecimalValue,formatedTrValue,saDecimalValue, countDecimalValue));
		
			//int rtComKey = StringUtility.parseIntegerSafely(trDecimalValue).getResult();
			//if (m1553bModel.getRtComs().containsKey(rtComKey))
			{
				//RtCom rtCom = m1553bModel.getRtComs().get(rtComKey);
				int count = StringUtility.parseIntegerSafely(countDecimalValue).getResult();
				
				if (isBcToRt)
				{
					String statusData = rtComBits.substring(0, 16);
					frameData.setStatus(IcdUtility.binaryString2HexString(statusData));
					
					while (count > 0)
					{
						String data = rtComBits.substring(0, 16);
						rtComBits = rtComBits.substring(16);	

						frameData.setDatas(frameData.getDatas() + IcdUtility.binaryString2HexString(data) + " " );						
						count = count - 1;
					}
				}
				else
				{
					while (count > 0)
					{
						String data = rtComBits.substring(0, 16);
						rtComBits = rtComBits.substring(16);	

						frameData.setDatas(frameData.getDatas() + IcdUtility.binaryString2HexString(data) + " " );						
						count = count - 1;
					}
					
					String statusData = rtComBits.substring(0, 16);
					rtComBits = rtComBits.substring(16);
					frameData.setStatus(IcdUtility.binaryString2HexString(statusData));
					
				}				
			}
			
			return frameData;
		}
		catch(Exception ex)
		{
			logger.error("M1553FrameData:resolveFrameData", ex);
			return null;
		}

	}
	
}
