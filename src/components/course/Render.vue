<!-- 
    openlayers里的渲染有两种
    一种styleFunction：(feature,number《代表图层的分辨率》) => {return new Style();}
    一种RenderFunction：(pixel,state《代表renderer的状态信息》) => {《可以用canvas画出样式》};
-->
<template>
    <div id="map">
    </div>
</template>
<script>
import TileLayer from 'ol/layer/Tile';
import XYZ from "ol/source/XYZ.js";
import { View } from 'ol';
import * as olProj from "ol/proj";
import Map from 'ol/Map';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorLayer from 'ol/layer/Vector';
import { Fill, Style } from 'ol/style.js';
import Stroke from 'ol/style/Stroke';

export default {
    name: "render",
    data() {
        return {
            // 地图
            openMap: null,
        }
    },
    mounted() {
        this.initMap();
    },
    methods: {
        initMap() {
            // 唯一值渲染
            class UniqueValueStyle {
                constructor(option) {
                    return (feature) => {
                        console.log(feature.get(option.field))
                        const color = strToRgb(`${feature.get(option.field)}`)
                        return new Style({
                            fill: new Fill({
                                color: color
                            }),
                        })
                    }
                }
            }

            // 分段渲染
            class RangeValueStyle {
                constructor(option) {
                    return (feature) => {
                        console.log(feature.get(option.field))
                        if (feature.get(option.field) > 50) {
                            return new Style({
                                fill: new Fill({
                                    color: "rgb(255,0,0)"
                                }),
                            })
                        } else {
                            return new Style({
                                fill: new Fill({
                                    color: "rgb(0,255,0)"
                                }),
                            })
                        }
                    }
                }
            }


            // 上面的唯一值渲染代码用到的函数
            function strToRgb(str) {
                return toRGB(hashCode(str))
            }
            function hashCode(str) {  // 将字符串转换为一个数字（hashcode）
                let hash = 0;
                for (let i = 0; i < str.length; i++) {
                    hash = str.charCodeAt(i) + ((hash << 5) - hash);
                }
                return hash;
            }
            function intToRGB(i) {  // 生成一个 RGB 值 
                const c = (i & 0x00FFFFFF).toString(16).toUpperCase();
                return "00000".substring(0, 6 - c.length) + c;
            }
            function toRGB(hash) {  // 将 RGB 值转换为 CSS 颜色值：rgb(r, g, b)
                const hexColor = intToRGB(hash);
                const red = parseInt(hexColor.substring(0, 2), 16);
                const green = parseInt(hexColor.substring(2, 4), 16);
                const blue = parseInt(hexColor.substring(4, 6), 16);
                return `rgb(${red}, ${green}, ${blue})`;
            }



            this.openMap = new Map({
                target: "map",
                layers: [
                    // 天地图影像（无注记）
                    new TileLayer({
                        source: new XYZ({
                            url: "http://t3.tianditu.com/DataServer?T=img_w&tk=440c186cfe5778c06d80c254ca8f5c64&x={x}&y={y}&l={z}"
                        })
                    }),
                    // 天地图注记
                    new TileLayer({
                        source: new XYZ({
                            url: "http://t4.tianditu.com/DataServer?T=cva_w&tk=440c186cfe5778c06d80c254ca8f5c64&x={x}&y={y}&l={z}"
                        })
                    }),
                    new VectorLayer({
                        source: new VectorSource({
                            url: 'http://localhost:8080/geoserver/ws-world/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ws-world%3Achina&maxFeatures=50&outputFormat=application%2Fjson',
                            format: new GeoJSON(),
                        }),
                        // 简单填充类型
                        style: new Style({
                            fill: new Fill({
                                color: [255, 0, 0, 0.25]
                            }),
                            stroke: new Stroke({
                                color: 'rgba(255,255,255,0.7)',
                                width: 1,
                            })
                        }),
                        // // 唯一值渲染
                        style: new UniqueValueStyle({
                            field: 'NAME',
                        }),
                        // // 分段渲染
                        style: new RangeValueStyle({
                            field: "Shape_area",
                        })
                    })
                ],
                view: new View({
                    center: olProj.fromLonLat([108.945951, 34.465262]),
                    zoom: 4
                }),
                controls: []
            })
        }
    }
}
</script>
<style>
#map {
    width: 100%;
    height: 100%;
}
</style>