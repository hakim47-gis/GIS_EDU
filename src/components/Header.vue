<template>
    <el-row :gutter="20">
        <el-col :span="4">
            地理实验室
        </el-col>
        <el-col :span="16">
            <el-menu class="el-menu-demo" mode="horizontal" background-color="#c00000" text-color="#fff"
                active-text-color="#000">
                <el-menu-item index="1">
                    <span><router-link to="/">简介</router-link></span>
                </el-menu-item>
                <el-menu-item index="2">
                    <span><router-link to="/xibeidiqv">01 西北地区</router-link></span>
                </el-menu-item>
            </el-menu>
        </el-col>
    </el-row>
</template>
<style>
.el-row {
    /* margin-top:10px;*/
    margin-bottom: 10px;
}

.el-row:last-child {
    margin-bottom: 0;
}

.el-col {
    border-radius: 4px;
}

.bg-purple {
    background: #d3dce6;
}

.grid-content {
    border-radius: 4px;
    min-height: 36px;
}</style>
