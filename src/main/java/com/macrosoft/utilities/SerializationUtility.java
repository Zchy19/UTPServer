package com.macrosoft.utilities;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;

public class SerializationUtility<T> {

	private static final ILogger logger = LoggerFactory.Create(SerializationUtility.class.getName());
	
	public void Serialize(T source, String path) throws IOException
	{
		FileOutputStream fileOut = new FileOutputStream(path);
		ObjectOutputStream out = new ObjectOutputStream(fileOut);
		out.writeObject(source);
		out.close();
		fileOut.close();
		logger.info("Serialized data is saved in path :" + path);
	}
	
	public T Deserialize(String path) throws ClassNotFoundException, IOException
	{
	     FileInputStream fileIn = new FileInputStream(path);
         ObjectInputStream in = new ObjectInputStream(fileIn);
         T result = (T) in.readObject();
         in.close();
         fileIn.close();	
         
         return result;
	}
}
