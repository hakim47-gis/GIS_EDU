<template>
    <div id="map">
        <div id="info">&nbsp;</div>
    </div>
</template>
<script>
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import XYZ from "ol/source/XYZ.js";
import * as olProj from "ol/proj";
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorSource from 'ol/source/Vector.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { Stroke, Style } from 'ol/style.js';
export default {
    name: 'xibeidiqv',
    data() {
        return {
            // 地图
            openMap: null,
            // 中国图层
            chinaLayer: null,
            // 命中检测高亮图层
            featureOverlay: null,
            // 用来存储被高亮的要素
            highlight: null
        }
    },
    components: {
    },
    mounted() {
        this.initMap();
    },
    methods: {
        initMap() {
            // 阿里dataV的中国地图（因为需要在displayFeatureInfo()中用到这个图层，所以先将它放到data中）
            this.chinaLayer = new VectorLayer({
                source: new VectorSource({
                    format: new GeoJSON(),
                    url: "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json",
                }),
                style: {
                    'stroke-width': 0.75,
                    'stroke-color': 'white',
                    'fill-color': 'rgba(100,100,100,0.25)',
                },
            });
            // 命中检测触发后的高亮图层（同样要在displayFeatureInfo()中用到）
            this.featureOverlay = new VectorLayer({
                source: new VectorSource(),
                style: new Style({
                    stroke: new Stroke({
                        color: 'rgba(255,0,0,0.7)',
                        width: 2,
                    }),
                }),
            })

            this.openMap = new Map({
                target: 'map',
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
                    // 阿里dataV 中国地图
                    this.chinaLayer,
                    // 西北地区范围
                    new VectorLayer({
                        source: new VectorSource({
                            format: new GeoJSON(),
                            url: "http://localhost:8080/geoserver/vue-gis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=vue-gis%3Axibeidiqv&maxFeatures=50&outputFormat=application%2Fjson",
                        }),
                        style: {
                            'stroke-width': 0.75,
                            'stroke-color': 'white',
                            'fill-color': 'rgba(204,102,0,0.25)',
                        },
                    }),
                    // 命中检测触发后的高亮图层
                    this.featureOverlay
                ],
                view: new View({
                    center: olProj.fromLonLat([108.945951, 34.465262]),
                    zoom: 4
                }),
                controls: []
            })


            // 矢量图层命中检测
            this.openMap.on("pointermove", (e) => {
                // 当鼠标正在拖动时，不触发命中检测
                if (e.dragging) {
                    return;
                }
                // 获得事件的所在像元
                const pixel = this.openMap.getEventPixel(e.originalEvent);
                // 调用命中检测函数
                this.displayFeatureInfo(pixel)
            })
            this.openMap.on("click", (e) => {
                // 当地图被点击时同样触发命中检测函数
                this.displayFeatureInfo(e);
            })
        },
        displayFeatureInfo(pixel) {
            // 获得像元所在矢量要素
            this.chinaLayer.getFeatures(pixel).then((features) => {
                // 如果有要找的要素（返回的要素集长度不为0），
                // 就将返回的要素集中的第一个当作命中检测到的要素，否则就是没找到（undefined）
                const feature = features.length ? features[0] : undefined;
                // 获取显示“命中检测到的要素的信息”的标签的js对象
                const info = document.getElementById("info");
                // 如果检测到了要素，就显示检测到的要素集中的第一个
                // 否则不显示
                if (features.length) {
                    info.innerHTML = feature.get("name");
                } else {
                    info.innerHTML = "&nbsp;"
                }
                // 如果检测到的要素不是之前的要素，就删掉高亮图层中之前的要素，加上新检测到的要素
                if (feature !== this.highlight) {
                    if (this.highlight) {
                        this.featureOverlay.getSource().removeFeature(this.highlight);
                    }
                    if (feature) {
                        this.featureOverlay.getSource().addFeature(feature);
                    }
                    // 将本次检测到的要素存起来，用于下一次命中检测
                    this.highlight = feature
                }
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

#info {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1000;
    color: aliceblue;
}
</style>