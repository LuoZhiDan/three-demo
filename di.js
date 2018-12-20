function() {
    return {
      //组件初始化
      "init" : function(options) {
          this._super.apply(this,arguments);
       },
      //容器内所有组件加载完成
      "allChildrenLoaded": function(){
           

       },
       dataSource: function( options ){
            var series = options.series;
            series[0].geoCoord['加拿大'] = [-123.322910,49.553730]; // 设置加拿大经纬度坐标

            var data = series[0].markLine.data;
            data.map(function(item){
                /**
                 *  如果开启起点->使用固定起点 配置item[0].name = '加拿大', //表示起点
                 *  如果开启终点->使用固定起点 配置item[1].name = '加拿大', //表示终点
                 */
                item[0].name = '加拿大'; 
                item[0].geoCoord = [-123.322910,49.553730];
            });
       }
    };
 }