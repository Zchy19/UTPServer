package com.macrosoft.configuration;

import com.macrosoft.datasource.MultiTenantConnectionProviderImpl;
import com.macrosoft.model.TestCaseRequirementMapping;
import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.orm.hibernate4.LocalSessionFactoryBean;

import javax.sql.DataSource;
import java.util.Properties;

@Configuration
public class HibernateConfig {

    private DataSource dataSource;
    private MultiTenantConnectionProviderImpl multiTenantConnectionProvider;
    private CurrentTenantIdentifierResolver tenantIdentifierResolver;

    @Autowired
    public void setDataSource(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Autowired
    public void setMultiTenantConnectionProvider(MultiTenantConnectionProviderImpl multiTenantConnectionProvider) {
        this.multiTenantConnectionProvider = multiTenantConnectionProvider;
    }

    @Autowired
    public void setTenantIdentifierResolver(@Qualifier("currentTenantIdentifierResolverImpl") CurrentTenantIdentifierResolver tenantIdentifierResolver) {
        this.tenantIdentifierResolver = tenantIdentifierResolver;
    }

    @Bean
    public LocalSessionFactoryBean sessionFactory() {
        LocalSessionFactoryBean sessionFactory = new LocalSessionFactoryBean();

        sessionFactory.setDataSource(dataSource);

        // 设置多租户支持
        sessionFactory.setMultiTenantConnectionProvider(multiTenantConnectionProvider);
        sessionFactory.setCurrentTenantIdentifierResolver(tenantIdentifierResolver);

        // 设置 Hibernate 注解类
        sessionFactory.setAnnotatedClasses(
            com.macrosoft.model.UserRole.class,
            com.macrosoft.model.Requirement.class,
            TestCaseRequirementMapping.class,
            com.macrosoft.model.Project.class,
            com.macrosoft.model.AgentConfig.class,
            com.macrosoft.model.ScriptGroup.class,
            com.macrosoft.model.TestSet.class,
            com.macrosoft.model.ScriptLink.class,
            com.macrosoft.model.Script.class,
            com.macrosoft.model.Recorder.class,
            com.macrosoft.model.BigData.class,
            com.macrosoft.model.ExecutionStatus.class,
            com.macrosoft.model.ExecutionResult.class,
            com.macrosoft.model.ExecutionTestCaseResult.class,
            com.macrosoft.model.TestsetExecutionTrigger.class,
            com.macrosoft.model.RecoverSubscriptReference.class,
            com.macrosoft.model.SubscriptReference.class,
            com.macrosoft.model.MonitorData.class,
            com.macrosoft.model.JsonStorage.class,
            com.macrosoft.model.BigdataStorage.class,
            com.macrosoft.model.MessageTemplate.class,
            com.macrosoft.model.MonitoringTestSet.class,
            com.macrosoft.model.MonitoringExecutionDetail.class,
            com.macrosoft.model.MonitoringExecution.class,
            com.macrosoft.model.ProtocolSignal.class,
            com.macrosoft.model.ExecutionData.class,
            com.macrosoft.model.SpecialTest.class,
            com.macrosoft.model.SpecialTestData.class,
            com.macrosoft.model.ExecutionCheckPoint.class,
            com.macrosoft.model.TestCase.class,
            com.macrosoft.model.RunnableScript.class
        );

        // 设置 Hibernate 属性
        Properties hibernateProperties = new Properties();
        hibernateProperties.setProperty("hibernate.multiTenancy", "DATABASE");
        hibernateProperties.setProperty("hibernate.dialect", "org.hibernate.dialect.MySQLDialect");
        hibernateProperties.setProperty("hibernate.show_sql", "false");
        hibernateProperties.setProperty("hibernate.format_sql", "false");
        sessionFactory.setHibernateProperties(hibernateProperties);

        return sessionFactory;
    }

    @Bean(name = "masterSessionFactory")
    public LocalSessionFactoryBean masterSessionFactory(@Qualifier("dataSource") DataSource dataSource) {
        LocalSessionFactoryBean sessionFactory = new LocalSessionFactoryBean();
        sessionFactory.setDataSource(dataSource);
        sessionFactory.setAnnotatedClasses(
                com.macrosoft.master.ClientDbConnection.class
        );

        Properties hibernateProperties = new Properties();
        hibernateProperties.setProperty("hibernate.dialect", "org.hibernate.dialect.MySQLDialect");
        hibernateProperties.setProperty("hibernate.show_sql", "false");
        sessionFactory.setHibernateProperties(hibernateProperties);

        return sessionFactory;
    }
}