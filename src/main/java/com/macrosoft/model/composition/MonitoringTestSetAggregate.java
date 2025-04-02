package com.macrosoft.model.composition;

import com.macrosoft.model.MonitoringTestSet;
import com.macrosoft.model.Script;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MonitoringTestSetAggregate {
    private MonitoringTestSet monitoringTestSet;
    private Script[] scripts;
}
