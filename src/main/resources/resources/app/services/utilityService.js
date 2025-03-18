define([], function () {
  function utilityService() {
    this.template = {
      message: '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i>',
      css: {
        border: "none",
        backgroundColor: "transparent",
      },
      baseZ: 2000,
    };

    this.getNowString = function () {
      var now = new Date();
      return (
        now.getFullYear() +
        "-" +
        (now.getMonth() + 1) +
        "-" +
        now.getDate() +
        " " +
        now.getHours() +
        ":" +
        now.getMinutes() +
        ":" +
        now.getSeconds()
      );
    };

    this.validateEmail = function (email) {
      var re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    };

    this.validatePhone = function (phone) {
      var re = /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/;
      return re.test(String(phone).toLowerCase());
    };

    this.formatMilliSecondToHourMinSecond = function (milliSecond) {
      try {
        var hour = 0;
        var minute = 0;
        var second = 0;

        second = parseInt(milliSecond / 1000);

        if (second > 60) {
          minute = parseInt(second / 60);
          second = second % 60;
        }
        if (minute > 60) {
          hour = parseInt(minute / 60);
          minute = minute % 60;
        }
        var newHour = "";
        if (hour <= 9) {
          newHour = "0" + hour;
        } else {
          newHour = "" + hour;
        }
        var newMinute = "";
        if (minute <= 9) {
          newMinute = "0" + minute;
        } else {
          newMinute = "" + minute;
        }
        var newSecond = "";
        if (second <= 9) {
          newSecond = "0" + second;
        } else {
          newSecond = "" + second;
        }

        milliSecond = milliSecond % 1000;
        return newHour + ":" + newMinute + ":" + newSecond + ":" + milliSecond;
      } catch (Exception) {
        return milliSecond;
      }
    };

    this.getFriendlyId = function (len = 6) {
      const vowel = "aeiou";
      const consonant = "bcdfghjklmnpqrstvwxyz";
      let id = "";

      while (id.length < len) {
        id += randChar(consonant) + randChar(vowel);
      }

      return id;
    };

    function randChar(text) {
      return text[Math.floor(Math.random() * text.length)];
    }

    this.addExtensionIfNeeded = function (filename, extension) {
      if (filename.toLowerCase().endsWith(extension.toLowerCase())) {
        return filename;
      }
      return filename + extension;
    };

    this.removeFileExtension = function (filename, extension) {
      if (filename.toLowerCase().endsWith(extension.toLowerCase())) {
        return filename.substring(0, filename.length - extension.length);
      }
      return filename;
    };

    this.formatSize = function (size) {
      if (size < 900) {
        return size.toFixed() + " B";
      }

      const KB = size / 1000;
      if (KB < 900) {
        return KB.toFixed(1) + " KB";
      }

      const MB = KB / 1000;
      if (MB < 900) {
        return MB.toFixed(1) + " MB";
      }

      const GB = MB / 1000;
      if (GB < 900) {
        return GB.toFixed(1) + " GB";
      }

      const TB = GB / 1000;
      return TB.toFixed(1) + " TB";
    };

    this.removeClassName = function (elem, className) {
      const classes = elem.className.split(" ");
      const index = classes.indexOf(className);
      if (index !== -1) {
        classes.splice(index, 1); // remove the class from the array
        elem.className = classes.join(" ");
      }
    };

    this.addClassName = function (elem, className) {
      const classes = elem.className.split(" ");
      if (classes.indexOf(className) === -1) {
        classes.push(className); // add the class to the array
        elem.className = classes.join(" ");
      }
    };

    this.getType = function (object) {
      if (object === null) {
        return 'null'
      }
      if (object === undefined) {
        return 'undefined'
      }
      if ((object instanceof Number) || (typeof object === 'number')) {
        return 'number'
      }
      if ((object instanceof String) || (typeof object === 'string')) {
        return 'string'
      }
      if ((object instanceof Boolean) || (typeof object === 'boolean')) {
        return 'boolean'
      }
      if (object instanceof RegExp) {
        return 'regexp'
      }
      if (isArray(object)) {
        return 'array'
      }
    
      return 'object'
    },
    
    this.getInteger = function(val){
      try{
        val = '' + val;
        regex = new RegExp("^0x[A-Fa-f0-9]+$");
        if(regex.test(val.trim()))
        return parseInt(val.trim().substring(2), 16);		  
        else
        return Number(val.trim());
      } catch(e) {
        return NaN;	
      }
    }
  }
  return new utilityService();
});
