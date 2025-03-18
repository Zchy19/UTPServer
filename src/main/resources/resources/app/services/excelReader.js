define(['jquery','xlsx'], function($, XLSX) {
	function excelReader() {
		
		var self = this;
        this.rABS = false;
        
		this.fixdata = function(data) { //文件流转BinaryString
            var o = "",
                l = 0,
                w = 10240;
            for(; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
            o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
            return o;
        };

		this.transData = function(a, idStr, pidStr, chindrenStr){
			var r = [], hash = {}, id = idStr, pid = pidStr, children = chindrenStr, i = 0, j = 0, len = a.length;
			for(; i < len; i++){
				hash[a[i][id]] = a[i];
			}
			for(; j < len; j++){
				var aVal = a[j], hashVP = hash[aVal[pid]];
				if(hashVP){
					!hashVP[children] && (hashVP[children] = []);
					hashVP[children].push(aVal);
				}else{
					r.push(aVal);
				}
			}
			return r;
		};
		
		this.getOrderedFlatTreeData = function(projectId, data){
			var flatData = [];
			var targets = data;
			while(targets.length > 0){
				var children = [];
				for(var i=0; i< targets.length; i++){
					var target = {
						id : targets[i].id,
						customizedId: targets[i].customizedId,
						projectId : projectId,
						parentId : targets[i].pid === 'project' ? 0 : targets[i].pid,
						description : targets[i].description,
						title : targets[i].title,
						leaf: targets[i].type == "需求组" ? false : true,
						comment: targets[i].comment,
						type : targets[i].type == "检查点" ? "checkpoint": targets[i].type == "需求组" ? "requirementgroup" : "requirement"
					}
					flatData.push(JSON.parse(JSON.stringify(target)));
					if(target.leaf && targets[i].children != undefined && targets[i].children != null)
						return [];
					if(targets[i].children != undefined && targets[i].children != null){
						for(var j=0;j<targets[i].children.length;j++)
							children.push(targets[i].children[j]);
					}
				}
				targets = JSON.parse(JSON.stringify(children));
			}
			return flatData;
		};
		
		this.getData = function(projectId, file, callback){
			if(!file) return;
			
            var reader = new FileReader();
            var wb;
            reader.onload = function(e) {
                var data = e.target.result;
                
                if(self.rABS)
                    wb = XLSX.read(btoa(self.fixdata(data)), {type: 'base64'});
                else
                    wb = XLSX.read(data, {type: 'binary'});
                
                var jsonData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
				var jsonDataTree = self.transData(jsonData, 'id', 'pid', 'children');				
				var flatData = self.getOrderedFlatTreeData(projectId,jsonDataTree);
				console.log(flatData);				
				if (typeof callback === "function")
					callback(flatData);
            };
            
            if(self.rABS)
                reader.readAsArrayBuffer(file);
            else
                reader.readAsBinaryString(file);
		};
	}
	return new excelReader();
})