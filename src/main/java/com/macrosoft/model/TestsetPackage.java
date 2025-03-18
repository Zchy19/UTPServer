package com.macrosoft.model;

import java.util.ArrayList;
import java.util.List;

public class TestsetPackage implements java.io.Serializable{
    public List<ProtocolSignal> protocolSignals;
    public List<ExecutionResult> executionResults;
    public List<ExecutionStatus> executionStatuses;
    public List<ExecutionTestCaseResult> executionTestCaseResults;

    public TestsetPackage Clone()
    {
        TestsetPackage testsetPackage = new TestsetPackage();
        testsetPackage.protocolSignals = new ArrayList<ProtocolSignal>();
        if (this.protocolSignals!= null){
            for (ProtocolSignal protocolSignal : this.protocolSignals)
            {
                testsetPackage.protocolSignals.add(protocolSignal.Clone());
            }
        }

        testsetPackage.executionResults = new ArrayList<ExecutionResult>();
        for (ExecutionResult executionResult : this.executionResults)
        {
            testsetPackage.executionResults.add(executionResult.Clone());
        }

        testsetPackage.executionStatuses = new ArrayList<ExecutionStatus>();
        for (ExecutionStatus executionStatus : this.executionStatuses)
        {
            testsetPackage.executionStatuses.add(executionStatus.Clone());
        }

        testsetPackage.executionTestCaseResults = new ArrayList<ExecutionTestCaseResult>();
        for (ExecutionTestCaseResult executionTestCaseResult : this.executionTestCaseResults)
        {
            testsetPackage.executionTestCaseResults.add(executionTestCaseResult.Clone());
        }

        return testsetPackage;
    }
}
