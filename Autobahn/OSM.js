var OsmElementType;
(function (OsmElementType) {
    OsmElementType["node"] = "node";
    OsmElementType["way"] = "way";
})(OsmElementType || (OsmElementType = {}));
class OverpassController {
    constructor(overpassResponse) {
        this.overpassResponse = overpassResponse;
    }
    IsNode(element) {
        return element.type == OsmElementType.node;
    }
    IsWay(element) {
        return element.type == OsmElementType.way;
    }
    get Nodes() {
        return this.overpassResponse.elements.filter(this.IsNode);
    }
    get Ways() {
        return this.overpassResponse.elements.filter(this.IsWay);
    }
}
//# sourceMappingURL=OSM.js.map