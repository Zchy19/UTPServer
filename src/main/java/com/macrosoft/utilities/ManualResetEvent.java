package com.macrosoft.utilities;

import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.locks.Condition;

public class ManualResetEvent
{
	private Lock locker = new ReentrantLock();
    private Condition c;
    
    public ManualResetEvent(boolean initialState)
    {
    	c = locker.newCondition();
    }
    
    public void waitOne()
    {
    	try
        {
        	locker.lock();
    		c.await();
        }
    	catch (InterruptedException ex)
    	{
    		
    	}
    	finally
    	{
        	locker.unlock();
    	}
    }

    public void set()
    {
    	locker.lock();
    	c.signal();
    	locker.unlock();	
    }

    public void reset()
    {
    	c = locker.newCondition();
    }
}