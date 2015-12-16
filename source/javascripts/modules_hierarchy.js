$(function() {

	var margin = {top: 30, right: 20, bottom: 30, left: 20},
			width = 960 - margin.left - margin.right,
			barHeight = 40,
			barWidth = width * 0.8;

	var i = 0,
			duration = 400,
			root;

	var tree = d3.layout.tree()
								.nodeSize([0, 20]);

	var diagonal = d3.svg.diagonal()
										.projection(function(d) { return [d.y, d.x]; });

	var svg = d3.select("#mod_hierarchy").append("svg")
							.attr("width", width + margin.left + margin.right)
						.append("g")
							.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.json("../json_sources/modules_hierarchy.json", function(error, hierarchy) {
		if(error) throw error;

		hierarchy.x0 = 0;
		hierarchy.y0 = 0;
		update(root = hierarchy);
	});

	function update(source) {
		var nodes = tree.nodes(root);

		var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

		d3.select("svg").transition()
				.duration(duration)
				.attr("height", height);

		d3.select(self.frameElement).transition()
				.duration(duration)
				.style("height", height + "px");

		nodes.forEach(function(n, i) {
			n.x = i * barHeight;
		});

		var node = svg.selectAll("g.node")
					.data(nodes, function(d) { return d.id || (d.id = ++i); });

		var nodeEnter = node.enter().append("g")
					.attr("class", "node")
					.attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
					.style("opacity", 1e-6);

		nodeEnter.append("rect")
			.attr("y", -barHeight / 2)
			.attr("height", barHeight)
			.attr("width", barWidth)
			.style("fill", color)
			.on("click", click);

		nodeEnter.append("text")
			.attr("dy", 5.5)
			.attr("dx", 5.5)
			.text(function(d) { return d.name });

		nodeEnter.transition()
				.duration(duration)
				.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
				.style("opacity", 1);

		node.transition()
				.duration(duration)
				.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
				.style("opacity", 1)
			.select("rect")
				.style("fill", color);

		node.exit().transition()
					.duration(duration)
					.attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
					.style("opacity", 1e-6)
					.remove();

		var link = svg.selectAll("path.link")
						.data(tree.links(nodes), function(d) { return d.target.id; });

		link.enter().insert("path", "g")
					.attr("class", "link")
					.attr("d", function(d) {
						var o = {x: source.x0, y: source.y0};
						return diagonal({source: o, target: o});
					})
				.transition()
					.duration(duration)
					.attr("d", diagonal);

		link.transition()
					.duration(duration)
					.attr("d", diagonal);

		link.exit().transition()
					.duration(duration)
					.attr("d", function(d) {
						var o = {x: source.x, y: source.y};
						return diagonal({source: o, target: o});
					})
					.remove();

		nodes.forEach(function(d) {
			d.x0 = d.x;
			d.y0 = d.y;
		});
	}

	function click(d) {
		if (d.children) {
			d._children = d.children;
			d.children = null;
		} else {
			d.children = d._children;
			d._children = null;
		}
		update(d);
	}

	function color(d) {
		return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
	}
});