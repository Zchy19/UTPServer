package com.macrosoft.model;

import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;

/**
 * @description runablescript
 * @author zou chao
 * @date 2025-03-14
 */
@Entity
@Data
@Table(name="runnablescript")
public class RunnableScript implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue
    /**
     * Id
     */
    @Column(name="Id")
    private Long id;

    /**
     * Scriptid
     */
    @Column(name="Scriptid")
    private Long scriptid;

    /**
     * Description
     */
    @Column(name="Description")
    private String description;

    public RunnableScript() {
    }

}
