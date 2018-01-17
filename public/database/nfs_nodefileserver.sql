/*
SQLyog Community v10.3 
MySQL - 5.5.5-10.1.16-MariaDB : Database - nfs_nodefileserver
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`nfs_nodefileserver` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `nfs_nodefileserver`;

/*Table structure for table `n_file_info` */

DROP TABLE IF EXISTS `n_file_info`;

CREATE TABLE `n_file_info` (
  `id` varchar(64) NOT NULL COMMENT '编号',
  `expand_name` varchar(64) DEFAULT NULL COMMENT '扩展名',
  `file_size` bigint(64) DEFAULT NULL COMMENT '文件大小',
  `name` varchar(200) DEFAULT NULL COMMENT '文件名',
  `path` varchar(500) DEFAULT NULL COMMENT '文件路径',
  `source_type` varchar(50) DEFAULT NULL COMMENT '来源类型',
  `type` varchar(50) DEFAULT NULL COMMENT '文件类型',
  `md5` varchar(64) DEFAULT NULL COMMENT 'md5值',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `edit_time` datetime DEFAULT NULL COMMENT '编辑时间',
  `status` int(1) DEFAULT NULL COMMENT '状态位',
  `description` varchar(200) DEFAULT NULL COMMENT '描述，备注',
  `key` varchar(200) DEFAULT NULL COMMENT '文件备份返回值',
  `period_server` varchar(200) DEFAULT NULL COMMENT '文件备份的服务器',
  `is_period` tinyint(1) DEFAULT NULL COMMENT '文件是否已备份',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

/*Data for the table `n_file_info` */

/*Table structure for table `n_temp_file_info` */

DROP TABLE IF EXISTS `n_temp_file_info`;

CREATE TABLE `n_temp_file_info` (
  `id` varchar(64) NOT NULL COMMENT '编号',
  `expand_name` varchar(64) DEFAULT NULL COMMENT '扩展名',
  `file_size` bigint(64) DEFAULT NULL COMMENT '文件大小',
  `chunk` int(11) DEFAULT NULL COMMENT '当前分片',
  `chunks` int(11) DEFAULT NULL COMMENT '总分片术',
  `name` varchar(200) DEFAULT NULL COMMENT '文件名',
  `path` varchar(500) DEFAULT NULL COMMENT '文件路径',
  `source_type` varchar(50) DEFAULT NULL COMMENT '来源类型',
  `type` varchar(50) DEFAULT NULL COMMENT '文件类型',
  `md5` varchar(64) DEFAULT NULL COMMENT '当前分片的md5值',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `edit_time` datetime DEFAULT NULL COMMENT '编辑时间',
  `status` int(1) DEFAULT NULL COMMENT '状态位',
  `description` varchar(200) DEFAULT NULL COMMENT '描述，备注',
  `file_md5` varchar(64) DEFAULT NULL COMMENT '整个文件的md5值',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

/*Data for the table `n_temp_file_info` */

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
