package com.macrosoft.utilities;

import com.macrosoft.configuration.UrsConfigurationImpl;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.urs.UrsServiceApis;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;

public class FeaturesUtility {
    private static final ILogger logger = LoggerFactory.Create(FeaturesUtility.class.getName());
    //获取模块下的所有feature
    public static JsonNode GetFeaturesByModule(String ursIpAddress,String modelName)
    {
        String url = String.format(UrsServiceApis.GetFeatureByModelName,ursIpAddress,modelName) ;
        RestTemplate restTemplate = new RestTemplate();
        String utpResponse = restTemplate
                .getForObject(url, String.class,1);
        //解析utpResponse
        ObjectMapper mapper = new ObjectMapper();
        JsonNode result = null;
        try {
            result = mapper.readTree(utpResponse);
        } catch (IOException e) {
            logger.error("GetFeaturesByModule has exception:" + e.toString());
            return null;
        }
        //解析result
        JsonNode utpserverFeatures = result.get("systemConfigs");
        return utpserverFeatures;
    }

    //根据utpserverFeatures和featureName获取configValues

    public static String GetConfigValueByFeatureName(JsonNode utpserverFeatures,String featureName)
    {
        String configValue = null;
        for(JsonNode feature : utpserverFeatures)
        {
            if(feature.get("featureName").asText().equals(featureName))
            {
                configValue = feature.get("configValues").asText();
                //如果configValue为空，返回null
                if(configValue.equals(""))
                {
                    configValue = null;
                }
                break;
            }
        }

        return configValue;
    }

}
