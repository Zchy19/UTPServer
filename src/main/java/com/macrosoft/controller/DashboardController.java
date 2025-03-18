package com.macrosoft.controller;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTTbl;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTTblPr;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTTblWidth;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STTblWidth;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.dao.ExecutionTestCaseResultDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.Requirement;
import com.macrosoft.model.Script;
import com.macrosoft.model.composition.ExecutionResultInfo;
import com.macrosoft.utilities.CreateWordTableMerge;
import com.macrosoft.utilities.StringUtility;
import com.macrosoft.utilities.ExportTestCaseUtility;

@Controller
public class DashboardController {
	private static final ILogger logger = LoggerFactory.Create(DashboardController.class.getName());
	private ExecutionTestCaseResultDAO executionTestCaseResultDao;

	public static int counter = 1;

	@Autowired(required = true)
	public void setExecutionTestResultService(ExecutionTestCaseResultDAO executionTestCaseResultDao) {
		try {
			this.executionTestCaseResultDao = executionTestCaseResultDao;
		} catch (Exception ex) {
			logger.error(String.format("setExecutionTestResultService - :%s", ex.toString()));
		}
	}


	@RequestMapping(value = "/testWordGeneration", method = RequestMethod.GET)
	public @ResponseBody String getExecutionResultsSummary()
	{
	          try{  

	        	  String inputUrl = "D:\\Export_TestCaseTemplate.docx";
	        	  String outputUrl = "D:\\Export_TestCaseTemplate_output.docx";

	        	  StringUtility.GenerateUniqueIdByNow();
	        	  
	        	  Script s = new Script();
	        	  s.setId(1);
	        	  s.setDescription("description");
	        	  s.setScript("TESTCASE_BEGINóò[[UDP服务端]]```StartReceiveóò[[UDP客户端]]```SendMessageFromJson``` StopReceiveóòTESTCASE_END");
	        	  s.setName("testScript");
	        	  
	        	  Requirement req = new Requirement();
	        	  req.setTitle("testReq");
	        	  
	        	  List<Requirement> reqs = new ArrayList<Requirement>();
	        	  reqs.add(req);
	        	  
	          }catch(Exception e) {
	              System.out.println(e);  
	          }  

		return "";
	}
	
	@RequestMapping(value = "/", method = RequestMethod.GET)
	public ModelAndView Index(@RequestParam(value = "promoter", required = false) String promoter, Locale locale, Model model) {
		if(promoter == null || promoter.isEmpty())
			return new ModelAndView("index");
		return new ModelAndView("index", "model", promoter);
	}
}
