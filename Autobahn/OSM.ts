enum OsmElementType {
    node = "node",
    way = "way"
}

interface OsmElement {
    id: number,
    type: OsmElementType,
    tags: [[string, string]]
}

interface OsmNodeElement extends OsmElement {
    lat: number;
    lon: number;
}

interface Coordinate {
    lat: number;
    lon: number;
}

interface OsmWayElement extends OsmElement {
    geometry: Coordinate[];
    nodes: number[];
}

interface OverpassResponse {
    elements: OsmElement[]
}

class OverpassController {
    private overpassResponse: OverpassResponse;

    constructor(overpassResponse: OverpassResponse) {
        this.overpassResponse = overpassResponse;
    }

    private IsNode(element: OsmElement): boolean {
        return element.type == OsmElementType.node;
    }

    private IsWay(element: OsmElement): boolean {
        return element.type == OsmElementType.way;
    }

    public get Nodes(): OsmNodeElement[] {
        return <OsmNodeElement[]>this.overpassResponse.elements.filter(this.IsNode);
    }

    public get Ways(): OsmWayElement[] {
        return <OsmWayElement[]>this.overpassResponse.elements.filter(this.IsWay);
    }
}