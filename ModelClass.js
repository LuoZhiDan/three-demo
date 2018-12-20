import { copies, svgPath } from 'common-utils-zdluoa';

const _default = {
    width: 1024,
    height: 1024,
    padding: 10,
    geojson: null
}

export default class ModelClass{
    constructor( opts ){
        this.projection = d3.geoMercator();
        this.setOption( opts );
    }

    /**
     * 设置project，地图转换基数
     */
    setProjection( ) {
        var opts = this._options;
        if( opts.geojson && this.projection ){
            this.projection.fitExtent( [
                [opts.padding, opts.padding], 
                [opts.width - opts.padding * 2, opts.height - opts.padding * 2]], 
                opts.geojson );
        }
    }

    /**
     * 将geojson转换为svg路径
     */
    toPath(){
        this._store = [];
        var opts = this._options;
        var data = opts.geojson;
        const convert = d3.geoPath( this.projection );
        
        (data.features || data.series).map((d, i) => {
            let path = convert( d );
            this._store.push({
                _id: '_path_' + i,
                name: d.properties.name,
                cp: this.projection( d.properties.cp ),// 中心点
                // path: path, // svg 路径
                shape: svgPath( path )
            });
        });

        return this._store;
    }

    getStore(){
        return this._store || this.toPath();
    }

    /**
     * 将经纬度转换为坐标点
     */
    toCoord( cp ){
        return this.projection( cp );
    }
    
    /**
     * 配置
     * @param {*} opts 
     */
    setOption( opts ) {
        this._store = null;
        this._options = copies( this._options || {}, _default, opts );
        // 设置d3.geo各配置项
        this.setProjection();
    }

}