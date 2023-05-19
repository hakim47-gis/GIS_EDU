<!-- 
    1：点图查询有两条思路：new Select 和 map.forEachFeatureAtPixel
    2：空间查询和属性查询除了利用OGC标准地理信息服务向后端发送请求外
    还有一种通过写filterFunction的方法实现浏览器本地的查询
    3：最近一共学习了三种funciton
    styleFunction renderFunction filterFunction
 -->
<template>
    <div id="map">
        <div id="popup" class="ol-popup">
            <a href="#" id="popup-closer" class="ol-popup-closer"></a>
            <div id="popup-content"></div>
        </div>
    </div>
</template>
<script>
import VectorLayer from 'ol/layer/Vector';
import Map from "ol/Map"
import { Feature, Overlay, View } from 'ol';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import * as olProj from "ol/proj";
import { Style, Fill, Stroke } from 'ol/style';
import Select from 'ol/interaction/Select';
import { click } from 'ol/events/condition';
import { equalTo } from 'ol/format/filter';

export default {
    data() {
        return {
            openMap: null,
            feature: null
        }
    },
    mounted() {
        this.initMap();
        this.addClickEvt();
        // 还有一种方法就是点图选择要素（这里不采用这种方式）
        // this.addSelectInteraction();
        this.addOverlay();
        this.addQueryByAttribute();
    },
    methods: {
        initMap() {
            this.openMap = new Map({
                target: "map",
                layers: [
                    new VectorLayer({
                        source: new VectorSource({
                            url: 'https://openlayers.org/data/vector/ecoregions.json',
                            format: new GeoJSON(),
                        }),
                        background: 'white',
                        style: function (feature) {
                            const style = new Style({
                                fill: new Fill({
                                    color: '#eeeeee',
                                }),
                            });
                            const color = feature.get('COLOR') || '#eeeeee';
                            style.getFill().setColor(color);
                            return style;
                        },
                    })
                ],
                view: new View({
                    center: olProj.fromLonLat([108.945951, 34.465262]),
                    zoom: 4
                }),
                controls: []
            })
        },
        addClickEvt() {
            this.openMap.on("click", (e) => {
                const pixel = this.openMap.getEventPixel(e.originalEvent);
                const feature = this.openMap.forEachFeatureAtPixel(pixel, (feature, whereLayer) => {
                    // 第二个参数whereLayer代表feature所在图层
                    return feature;
                })
                this.feature = feature;
            })
        },
        addSelectInteraction() {
            // 设置点击时被选中
            const select = new Select({ condition: click });
            select.on("select", (e) => {
                const feature = e.target.getFeatures();
                this.feature = feature.array_[0];
            })
            this.openMap.addInteraction(select);
        },
        addOverlay() {
            const container = document.getElementById('popup');
            const content = document.getElementById('popup-content');
            const closer = document.getElementById('popup-closer');
            const overlay = new Overlay({
                element: container,
                // autoPan属性用来保证view能够完全将弹出的弹窗展示出来
                autoPan: {
                    animation: {
                        duration: 250,
                    },
                },
            });
            closer.onclick = function () {
                overlay.setPosition(undefined);
                closer.blur();
                return false;
            };
            // 这里用箭头函数，使得this指向当前的vue实例
            this.openMap.on('singleclick', (evt) => {
                const coordinate = evt.coordinate;
                try {
                    content.innerHTML = `ECO_NAME: ${this.feature.values_.ECO_NAME}`;
                    console.log(this.feature);
                    overlay.setPosition(coordinate);
                } catch (error) {
                    // 如果点击的pixel没有feature则将刚才的弹窗删去
                    overlay.setPosition(undefined);
                }
            });
            this.openMap.addOverlay(overlay);
        },
        addQueryByAttribute() {
            // 创建一个包含点数据的矢量层并添加到地图中
            const vectorSource = new VectorSource({
                url: 'https://openlayers.org/data/vector/ecoregions.json',
                format: new GeoJSON()
            });

            const vectorLayer = new VectorLayer({
                source: vectorSource,
                style: new Style({
                    stroke: new Stroke({
                        color: 'rgba(0, 0, 255, 1.0)',
                        width: 2
                    })
                })
            });

            this.openMap.addLayer(vectorLayer);

            // 创建一个包含输入框和按钮的 HTML 元素用于获取用户输入
            const inputElement = document.createElement('input');
            const buttonElement = document.createElement('button');
            buttonElement.textContent = '搜索';

            const containerElement = document.createElement('div');
            containerElement.appendChild(inputElement);
            containerElement.appendChild(buttonElement);

            document.body.appendChild(containerElement);

            buttonElement.addEventListener('click', () => {
                // 获取用户输入的属性值
                const inputValue = inputElement.value;

                // 创建一个属性过滤器
                // 最后一个参数是false：忽略大小写
                const filter = equalTo('ECO_NAME', inputValue, false);

                // 更新矢量层中的特征样式和视图焦点
                vectorSource.clear();
                //////////////////////////////////////////////////////////////////////// 
                // 1:这里的filter用法错了，懒得改了，如果做属性查询的时候直接结合geoserver
                // 2:也可以使用 FilterFunction 实现过滤，例子大概长这样
                // new Select({
                //     filter:(feature, layer)=>{
                //          return true/false
                //      }
                // }) 实现过滤
                // 3:同样的道理，filter也能实现空间查询，例如
                // //实现 filterFunction 函数来过滤与条件匹配的要素
                // function myFilterFunction(feature) {
                //     const boundingBox = [-50, -50, 50, 50]; // 矩形范围
                //     const geometry = feature.getGeometry();
                //     const extent = geometry.getExtent();

                //     return olExtent.intersects(extent, boundingBox);
                // }
                vectorSource.addFeature(vectorLayer.getSource().getFeatures(filter));
                this.openMap.getView().fit(vectorSource.getExtent(), { maxZoom: 5 });
            });
        }
    }
}
</script>
<style>
#map {
    height: 100%;
    width: 100%;
}

.ol-popup {
    position: absolute;
    background-color: white;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    padding: 15px;
    border-radius: 10px;
    border: 1px solid #cccccc;
    bottom: 12px;
    left: -50px;
    min-width: 280px;
    line-height: 20px;
}

.ol-popup:after,
.ol-popup:before {
    top: 100%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
}

.ol-popup:after {
    border-top-color: white;
    border-width: 10px;
    left: 48px;
    margin-left: -10px;
}

.ol-popup:before {
    border-top-color: #cccccc;
    border-width: 11px;
    left: 48px;
    margin-left: -11px;
}

.ol-popup-closer {
    text-decoration: none;
    position: absolute;
    top: 2px;
    right: 8px;
}

.ol-popup-closer:after {
    content: "✖";
}
</style>