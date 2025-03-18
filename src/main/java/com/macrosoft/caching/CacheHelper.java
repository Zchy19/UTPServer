package com.macrosoft.caching;

import org.springframework.cache.ehcache.EhCacheCacheManager;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;

import net.sf.ehcache.config.CacheConfiguration;
import net.sf.ehcache.config.DiskStoreConfiguration;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

public class CacheHelper {

	private static final ILogger logger = LoggerFactory.Create(CacheHelper.class.getName());

	private static Object mutex = new Object();
	private static final String CacheKey = "__Cache_Key__";
	private static CacheManager cacheManager;
	private static String CachingPath;

	private CacheHelper() {
	}

	public static void Initialize(String cachingPath) {
		if (CachingPath == null) {
			CachingPath = cachingPath;
			logger.info(String.format("CacheHelper Initialize  - :%s", cachingPath));
		}
	}

	public static Cache GetCache(String tenantId) {
		if (cacheManager == null) {
			cacheManager = new EhCacheCacheManager(ehCacheManager(CacheKey));
		}

		String tenantCacheKey = String.format("__Cache_TenantId_%s__", tenantId);
		return cacheManager.getCache(tenantCacheKey);
	}

	private static net.sf.ehcache.CacheManager ehCacheManager(String cacheName) {

		net.sf.ehcache.config.Configuration config = new net.sf.ehcache.config.Configuration();

		CacheConfiguration cacheConfiguration = new CacheConfiguration();
		cacheConfiguration.setName(cacheName);
		cacheConfiguration.setMemoryStoreEvictionPolicy("LRU");
		cacheConfiguration.setMaxEntriesLocalHeap(10000);

		DiskStoreConfiguration diskStoreConfigurationParameter = new DiskStoreConfiguration();
		diskStoreConfigurationParameter.setPath(CachingPath);

		config.addDiskStore(diskStoreConfigurationParameter);
		config.addCache(cacheConfiguration);

		return net.sf.ehcache.CacheManager.create(config);
	}

}