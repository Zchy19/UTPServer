package com.macrosoft.dao.impl;

import com.macrosoft.controller.dto.ProtocolSignalInfo;
import com.macrosoft.dao.ProtocolSignalDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.ProtocolSignal;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.transform.Transformers;
import org.hibernate.type.StandardBasicTypes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import java.text.SimpleDateFormat;
import java.util.List;

@Repository
public class ProtocolSignalDAOImpl implements ProtocolSignalDAO {
    private static final ILogger logger = LoggerFactory.Create(ProtocolSignalDAOImpl.class.getName());
    private static SimpleDateFormat sdf_time = new SimpleDateFormat("yyyy-MM-dd");

    private SessionFactory sessionFactory;
    @Autowired
    @Qualifier("sessionFactory")
    public void setSessionFactory(SessionFactory sf){
        this.sessionFactory = sf;
    }


    @Override
    public void addProtocolSignal(ProtocolSignal protocolSignalInfo) {
//        logger.info(String.format("addProtocolSignal()->id:%s", protocolSignal.getId()));
//
//        Session session = this.sessionFactory.getCurrentSession();
//        session.saveOrUpdate(protocolSignal);
//
//        TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addProtocolSignal", String.format("id: %s", protocolSignal.getId()));
//        logger.info(String.format("addProtocolSignal()->id:%s", protocolSignal.getId()));

        Session session = this.sessionFactory.getCurrentSession();
        StringBuilder sqlBuilder = new StringBuilder();

        // 构建 INSERT 语句
        sqlBuilder.append("INSERT INTO protocol_signal_table (Id, dataType, fileName, bigdata, organizationId, createdAt, protocolType, projectId) ");
        sqlBuilder.append("VALUES (:id, :dataType, :fileName, :bigdata, :organizationId, :createdAt, :protocolType, :projectId)");

        // 创建 SQLQuery 对象
        SQLQuery query = session.createSQLQuery(sqlBuilder.toString());

        // 设置参数
        query.setParameter("id", protocolSignalInfo.getId()); // 假设 Id 是手动设置的
        query.setParameter("dataType", protocolSignalInfo.getDataType());
        query.setParameter("fileName", protocolSignalInfo.getFileName());
        query.setParameter("bigdata", protocolSignalInfo.getBigdata());
        query.setParameter("organizationId", protocolSignalInfo.getOrganizationId());
        query.setParameter("createdAt", protocolSignalInfo.getCreatedAt()); // 当前时间
        query.setParameter("protocolType", protocolSignalInfo.getProtocolType());
        query.setParameter("projectId", protocolSignalInfo.getProjectId());

        // 执行插入操作
        int rowsAffected = query.executeUpdate();
        System.out.println("Rows inserted: " + rowsAffected);
    }



    @Override
    public ProtocolSignal getProtocolSignal(String id) {
        logger.info(String.format("getBigdataStorage()->id:%s, 000", id));

        Session session = this.sessionFactory.getCurrentSession();
        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append(" select id,dataType, bigdata, fileName, createdAt, organizationId,protocolType,projectId");
        sqlBuilder.append(" from protocol_signal_table ");
        sqlBuilder.append(" where id='" + id + "'");

        SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
        buildQueryProtocolSignalResult(query);


        List<ProtocolSignal> protocolSignal = query.list();

        if (protocolSignal.size() == 0)
        {
            logger.info(String.format("getBigdataStorage()->id:%s, return null", id));
            return null;
        }
        return protocolSignal.get(0);

    }

    public List<ProtocolSignalInfo> listProtocolSignalInfosByOrg(String dataType, long organizationId) {
        Session session = this.sessionFactory.getCurrentSession();
        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append(" select id, dataType, fileName, createdAt ,protocolType,projectId");
        sqlBuilder.append(" from protocol_signal_table ");
        sqlBuilder.append(" where dataType=:dataType and (organizationId =:organizationId or organizationId = 0) order by createdAt desc");
        SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
        query.setParameter("dataType", dataType);
        query.setParameter("organizationId", organizationId);
        buildQueryProtocolSignalInfoResult(query);
        List<ProtocolSignalInfo> ProtocolSignalInfo = query.list();
        return ProtocolSignalInfo;
    }
    @Override
    public List<ProtocolSignalInfo> listProtocolSignalInfos(String dataType, String projectId) {
        Session session = this.sessionFactory.getCurrentSession();
        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append(" select id, dataType, fileName, createdAt,protocolType,projectId ");
        sqlBuilder.append(" from protocol_signal_table ");
        sqlBuilder.append(" where dataType=:dataType ");
//        sqlBuilder.append(" and id in (select distinct protocolSignalId from agentconfig where projectid=:projectId) ");
        sqlBuilder.append(" and projectid=:projectId");
        sqlBuilder.append(" order by createdAt desc");

        SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
        query.setParameter("dataType", dataType);
        query.setParameter("projectId", projectId);

        buildQueryProtocolSignalInfoResult(query);

        List<ProtocolSignalInfo> ProtocolSignalInfo = query.list();
        return ProtocolSignalInfo;
    }

    @Override
    public List<ProtocolSignalInfo> listProtocolSignalInfosByProtocolType(String dataType, String protocolType, long organizationId) {
        Session session = this.sessionFactory.getCurrentSession();
        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append(" select id, dataType, fileName, createdAt ,protocolType,projectId");
        sqlBuilder.append(" from protocol_signal_table ");
        sqlBuilder.append(" where dataType=:dataType and (organizationId =:organizationId or organizationId = 0) and protocolType=:protocolType order by createdAt desc");
        SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
        query.setParameter("dataType", dataType);
        query.setParameter("protocolType", protocolType);
        query.setParameter("organizationId", organizationId);
        buildQueryProtocolSignalInfoResult(query);
        List<ProtocolSignalInfo> ProtocolSignalInfo = query.list();
        return ProtocolSignalInfo;
    }
    @Override
    public List<ProtocolSignalInfo> listProtocolSignalInfosByProjectIdAndPublic(String dataType, Integer projectId, long organizationId) {
        Session session = this.sessionFactory.getCurrentSession();
        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append(" select id, dataType, fileName, createdAt ,protocolType,projectId");
        sqlBuilder.append(" from protocol_signal_table ");
        sqlBuilder.append(" where dataType=:dataType and (projectId =:projectId or projectId IS NULL) and (organizationId =:organizationId or organizationId = 0) order by createdAt desc");
        SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
        query.setParameter("dataType", dataType);
        query.setParameter("projectId", projectId);
        query.setParameter("organizationId", organizationId);
        buildQueryProtocolSignalInfoResult(query);
        List<ProtocolSignalInfo> ProtocolSignalInfo = query.list();
        return ProtocolSignalInfo;
    }

    @Override
    public List<ProtocolSignalInfo> listProtocolSignalInfosByProtocolTypeAndProjectId(String dataType, String protocolType, long organizationId, Integer projectId) {
        Session session = this.sessionFactory.getCurrentSession();
        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append(" select id, dataType, fileName, createdAt ,protocolType,projectId");
        sqlBuilder.append(" from protocol_signal_table ");
        sqlBuilder.append(" where dataType=:dataType and (organizationId =:organizationId or organizationId = 0) and protocolType=:protocolType and (projectId =:projectId or projectId IS NULL) order by createdAt desc");
        SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
        query.setParameter("dataType", dataType);
        query.setParameter("protocolType", protocolType);
        query.setParameter("organizationId", organizationId);
        query.setParameter("projectId", projectId);
        buildQueryProtocolSignalInfoResult(query);
        List<ProtocolSignalInfo> ProtocolSignalInfo = query.list();
        return ProtocolSignalInfo;
    }

    @Override
    public void insertProtocolSignalByProtocolType(ProtocolSignalInfo protocolSignalInfo) {
        Session session = this.sessionFactory.getCurrentSession();
        StringBuilder sqlBuilder = new StringBuilder();

        // 构建 INSERT 语句
        sqlBuilder.append("INSERT INTO protocol_signal_table (Id, dataType, fileName, bigdata, organizationId, createdAt, protocolType, projectId) ");
        sqlBuilder.append("VALUES (:id, :dataType, :fileName, :bigdata, :organizationId, :createdAt, :protocolType, :projectId)");

        // 创建 SQLQuery 对象
        SQLQuery query = session.createSQLQuery(sqlBuilder.toString());

        // 设置参数
        query.setParameter("id", protocolSignalInfo.getId()); // 假设 Id 是手动设置的
        query.setParameter("dataType", protocolSignalInfo.getDataType());
        query.setParameter("fileName", protocolSignalInfo.getFileName());
        query.setParameter("bigdata", protocolSignalInfo.getMessages());
        query.setParameter("organizationId", 0);
        query.setParameter("createdAt", protocolSignalInfo.getCreatedAt()); // 当前时间
        query.setParameter("protocolType", protocolSignalInfo.getProtocolType());
        query.setParameter("projectId", protocolSignalInfo.getProjectId());

        // 执行插入操作
        int rowsAffected = query.executeUpdate();
        System.out.println("Rows inserted: " + rowsAffected);
    }

    @Override
    public void removeProtocolSignal(String id) {
        Session session = this.sessionFactory.getCurrentSession();
        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append(" delete from protocol_signal_table where id=:id  ");
        SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
        query.setParameter("id", id);
        query.executeUpdate();
        TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeProtocolSignal", String.format("id: %s", id));
    }

    @Override
    public void updateProtocolSignal(ProtocolSignal protocolSignal) {
        Session session = this.sessionFactory.getCurrentSession();
        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append(" update protocol_signal_table set bigdata =:bigdata");
        sqlBuilder.append(" , fileName=:fileName ");
        sqlBuilder.append(" , protocolType=:protocolType ");
        sqlBuilder.append(" where id=:id ");
        SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
        query.setParameter("id", protocolSignal.getId());
        query.setParameter("bigdata", protocolSignal.getBigdata());
        query.setParameter("fileName", protocolSignal.getFileName());
        query.setParameter("protocolType", protocolSignal.getProtocolType());
        query.executeUpdate();
        TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateProtocolSignal", String.format("id: %s", protocolSignal.getId()));
    }



    private SQLQuery buildQueryProtocolSignalResult(SQLQuery query) {
        query.setResultTransformer(Transformers.aliasToBean(ProtocolSignal.class));
        query.addScalar("id", StandardBasicTypes.STRING);
        query.addScalar("dataType", StandardBasicTypes.STRING);
        query.addScalar("bigdata", StandardBasicTypes.STRING);
        query.addScalar("fileName", StandardBasicTypes.STRING);
        query.addScalar("createdAt", StandardBasicTypes.TIMESTAMP);
        query.addScalar("organizationId", StandardBasicTypes.LONG);
        query.addScalar("protocolType", StandardBasicTypes.STRING);
        query.addScalar("projectId", StandardBasicTypes.INTEGER);


        return query;
    }

    private SQLQuery buildQueryProtocolSignalInfoResult(SQLQuery query) {
        query.setResultTransformer(Transformers.aliasToBean(ProtocolSignalInfo.class));
        query.addScalar("id", StandardBasicTypes.STRING);
        query.addScalar("dataType", StandardBasicTypes.STRING);
        query.addScalar("fileName", StandardBasicTypes.STRING);
        query.addScalar("createdAt", StandardBasicTypes.TIMESTAMP);
        query.addScalar("protocolType", StandardBasicTypes.STRING);
        query.addScalar("projectId", StandardBasicTypes.INTEGER);

        return query;
    }

}
