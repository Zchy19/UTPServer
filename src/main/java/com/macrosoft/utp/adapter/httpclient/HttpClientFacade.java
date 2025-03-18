package com.macrosoft.utp.adapter.httpclient;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;

import com.macrosoft.controller.ReportController;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;

public class HttpClientFacade {

	private static final ILogger logger = LoggerFactory.Create(HttpClientFacade.class.getName());
	
	private static final String USER_AGENT = "Mozilla/5.0";

	public static String HttpGet(String url) {

		try {
			/* TODO: add logic to handle this command here */
			CloseableHttpClient httpClient = HttpClients.createDefault();
			HttpGet httpGet = new HttpGet(url);
			httpGet.addHeader("User-Agent", USER_AGENT);
			CloseableHttpResponse httpResponse;
			StringBuffer response = new StringBuffer();

			httpResponse = httpClient.execute(httpGet);

			logger.info("GET Response Status:: "
					+ httpResponse.getStatusLine().getStatusCode());
			BufferedReader reader = new BufferedReader(new InputStreamReader(
					httpResponse.getEntity().getContent()));

			String inputLine;

			while ((inputLine = reader.readLine()) != null) {
				response.append(inputLine);
			}
			reader.close();

			// print result
			logger.info(response.toString());
			httpClient.close();

			return response.toString();

		} catch (ClientProtocolException ex) {
	        logger.error("HttpGet", ex);
		} catch (IOException ex) {
	        logger.error("HttpGet", ex);
		}

		return "";
	}

	public static String HttpGet(String url, String payload) {
		return "";
	}

	public static String HttpPost(String url) {
		return HttpPost(url, "");
	}

	public static String HttpPost(String url, String payload) {

		try {
			CloseableHttpClient httpClient = HttpClients.createDefault();
			HttpPost httpPost = new HttpPost(url);
			httpPost.addHeader("User-Agent", USER_AGENT);

			StringEntity jsonEntity;
			jsonEntity = new StringEntity(payload);

			jsonEntity.setContentType("application/json");
			httpPost.setEntity(jsonEntity);

			CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

			logger.info("POST Response Status:: "
					+ httpResponse.getStatusLine().getStatusCode());

			BufferedReader reader = new BufferedReader(new InputStreamReader(
					httpResponse.getEntity().getContent()));

			String inputLine;
			StringBuffer response = new StringBuffer();

			while ((inputLine = reader.readLine()) != null) {
				response.append(inputLine);
			}
			reader.close();

			// print result
			logger.info(response.toString());
			httpClient.close();
			return response.toString();

		} catch (Exception ex) {
        	logger.error("HttpPost", ex);
		}

		return "";

	}
}
