$(document).ready(function(){
	var margin = {top:110,bottom:30,left:50,right:200}
	var w = 1100 - margin.left - margin.right;
	var h = 650 - margin.top - margin.bottom;

	var svg = d3.select("div#svg")
	        .append("svg")
	        .attr("width", w + margin.left + margin.right)
	        .attr("height", h + margin.top + margin.bottom);
	// Define the div for the tooltip
	var div = d3.select("#svg").append("div")	
	    .attr("class", "tooltip")				
	    .style("opacity", 0);

	var xScale, xAxis, yScale, yAxis;
	var format = d3.time.format("%I:%M:%S %p").parse; // %m/%d/%y 
	var colorUnder70 = "#ffc907";
	var	colorBetween70To180 = "#a7a9ac";
	var	colorBetween180To250 = "#88b5e1";
	var	colorBetween250To300 = "#75a6d8";
	var	colorOver300 = "#8084c0";
	var colorLine = "#d6d7d9";
	
	var sidebarWidth = 100;
   
	renderData(1);

	$(".btn").click(function(event) {
		/* Act on the event */
		d3.selectAll("svg > *").remove();
		var number = $(this).attr('data');
		$(".btn-primary").removeClass('btn-primary');
		$(this).addClass('btn-primary');
		renderData(number);
	});

	function renderData(number) {

		d3.csv("assets/data/Patient"+number+".csv", function(error, data) {
			var dataset = [];
			var minBGValue = 0;
			var maxBGValue = 0;

			var BGValuePercentage = [
				{
					"category": "HYPO < 70",
					"value": 0
				},
				{
					"category": "70-180",
					"value": 0
				},
				{
					"category": "HYPO > 180",
					"value": 0
				},
				{
					"category": "HYPO > 250",
					"value": 0
				},
				{
					"category": "HYPO > 300",
					"value": 0
				}
			];// <70, 70-180, >180, >250, >300


	    	for(var i = 0; i < data.length; i++){
	    		// get max an min
	    		if(maxBGValue < parseInt(data[i].BGValue)) {
	    			maxBGValue = parseInt(data[i].BGValue)
	    		}


	    		// get percentage
	    		if(parseInt(data[i].BGValue) < 70) {
	    			BGValuePercentage[0].value ++;
	    		}
	    		if(parseInt(data[i].BGValue) >= 70 && parseInt(data[i].BGValue) <= 180) {
	    			BGValuePercentage[1].value ++;
	    		}
	    		if(parseInt(data[i].BGValue) > 300) {
	    			BGValuePercentage[4].value ++;
	    		}
	    		if(parseInt(data[i].BGValue) > 250) {
	    			BGValuePercentage[3].value ++;
	    		}
	    		if(parseInt(data[i].BGValue) > 180) {
	    			BGValuePercentage[2].value ++;
	    		}


				dataset.push({
					"id": data[i].id,
					"Date": data[i].Date,
					"Time": data[i].Time,
					"BGValue": data[i].BGValue,
					"Comment": data[i].Comment,
					"Type": data[i].Type,
					"Used": data[i].Used,
				});
			}
			console.log(dataset);

			maxBGValue =  Math.ceil(maxBGValue/10)*10;



			xScale = d3.time.scale()
							.domain([format("12:00:00 AM"),format("11:59:59 PM")])
							.range([0,w]);
		    xAxis = d3.svg.axis()
		                  .scale(xScale)
		                  .orient("bottom")
		                  .tickFormat(d3.time.format("%I:%M %p"));

			yScale = d3.scale.linear()
				    .domain([minBGValue,maxBGValue])
				    .rangeRound([h,0]);
		    yAxis = d3.svg.axis()
					    .scale(yScale)
					    .orient("left");


			var datasetByDate = []; // records of all Used:1
			var datasetTopGraph = [];
			var count = 0;
			var caountTopGraph = 0;
			var totalBGValue = 0;
			for(var i = 0; i < dataset.length; i++){
				caountTopGraph = 0;
				for(var j = 0; j < datasetTopGraph.length; j++) {
					if(datasetTopGraph[j].Date == dataset[i].Date) {
						caountTopGraph ++;
						datasetTopGraph[j].Value.push({
							"id": dataset[i].id,
							"Time": dataset[i].Time,
							"BGValue": dataset[i].BGValue,
							"Comment": dataset[i].Comment,
							"Type": dataset[i].Type,
							"Used": dataset[i].Used,
							"Date": dataset[i].Date
						});
					}	
				}
				if(caountTopGraph == 0) {
					var valueObjectArray = [];
					valueObjectArray.push({
						"id": dataset[i].id,
						"Time": dataset[i].Time,
						"BGValue": dataset[i].BGValue,
						"Comment": dataset[i].Comment,
						"Type": dataset[i].Type,
						"Used": dataset[i].Used,
						"Date": dataset[i].Date
					});
					datasetTopGraph.push({
						"Date": dataset[i].Date,
						"Value": valueObjectArray,
						"AverageBGValue": 0
					});
				}

				if(dataset[i].Used == "1"){
					count = 0;
					for(var j = 0; j < datasetByDate.length; j++) {
						if(datasetByDate[j].Date == dataset[i].Date) {
							count ++;
							datasetByDate[j].Value.push({
								"id": dataset[i].id,
								"Time": dataset[i].Time,
								"BGValue": dataset[i].BGValue,
								"Comment": dataset[i].Comment,
								"Type": dataset[i].Type,
								"Used": dataset[i].Used,
								"Date": dataset[i].Date
							});
						}	
					}
					if(count == 0) {
						var valueObjectArray = [];
						valueObjectArray.push({
							"id": dataset[i].id,
							"Time": dataset[i].Time,
							"BGValue": dataset[i].BGValue,
							"Comment": dataset[i].Comment,
							"Type": dataset[i].Type,
							"Used": dataset[i].Used,
							"Date": dataset[i].Date
						});
						datasetByDate.push({
							"Date": dataset[i].Date,
							"Value": valueObjectArray,
							"AverageBGValue": 0
						});
					}
				}
			}

			if( datasetTopGraph[datasetTopGraph.length - 1].Date == "" )
				datasetTopGraph.pop();
			
			//console.log(datasetTopGraph)


			



			// add horizontal background, from bottom to top
			var backgroundColorGroup = [];

			if(maxBGValue > 300) {
				backgroundColorGroup = [
					{
						"color": "#e8e9ea", 
						"height": h - yScale(maxBGValue)
					},
					{
						"color": "#eceded", 
						"height": h - yScale(300)
					},
					{
						"color": "#f1f2f2", 
						"height": h - yScale(250)
					},
					{
						"color": "#f4f4f5", 
						"height": h - yScale(180)
					},
					{
						"color": "#f1f2f2", 
						"height": h - yScale(70)
					},
					{
						"color": "#eceded", 
						"height": h - yScale(60)
					},
					{
						"color": "#e4e5e6", 
						"height": h - yScale(40)
					}
				];
			}
			else if(maxBGValue <= 300 && maxBGValue > 250) {
				backgroundColorGroup = [
					{
						"color": "#eceded", 
						"height": h - yScale(maxBGValue)
					},
					{
						"color": "#f1f2f2", 
						"height": h - yScale(250)
					},
					{
						"color": "#f4f4f5", 
						"height": h - yScale(180)
					},
					{
						"color": "#f1f2f2", 
						"height": h - yScale(70)
					},
					{
						"color": "#eceded", 
						"height": h - yScale(60)
					},
					{
						"color": "#e4e5e6", 
						"height": h - yScale(40)
					}
				];
			}
			else if(maxBGValue <= 250 && maxBGValue > 180) {
				backgroundColorGroup = [
					{
						"color": "#f1f2f2", 
						"height": h - yScale(maxBGValue)
					},
					{
						"color": "#f4f4f5", 
						"height": h - yScale(180)
					},
					{
						"color": "#f1f2f2", 
						"height": h - yScale(70)
					},
					{
						"color": "#eceded", 
						"height": h - yScale(60)
					},
					{
						"color": "#e4e5e6", 
						"height": h - yScale(40)
					}
				];
			}
			else if(maxBGValue <= 180 && maxBGValue > 70) {
				backgroundColorGroup = [
					{
						"color": "#f4f4f5", 
						"height": h - yScale(maxBGValue)
					},
					{
						"color": "#f1f2f2", 
						"height": h - yScale(70)
					},
					{
						"color": "#eceded", 
						"height": h - yScale(60)
					},
					{
						"color": "#e4e5e6", 
						"height": h - yScale(40)
					}
				];
			}
			else if(maxBGValue <= 70 && maxBGValue > 60) {
				backgroundColorGroup = [
					{
						"color": "#f1f2f2", 
						"height": h - yScale(maxBGValue)
					},
					{
						"color": "#eceded", 
						"height": h - yScale(60)
					},
					{
						"color": "#e4e5e6", 
						"height": h - yScale(40)
					}
				];
			}
			else if(maxBGValue <= 60 && maxBGValue > 40) {
				backgroundColorGroup = [
					{
						"color": "#eceded", 
						"height": h - yScale(maxBGValue)
					},
					{
						"color": "#e4e5e6", 
						"height": h - yScale(40)
					}
				];
			}
			else {
				backgroundColorGroup = [
					{
						"color": "#e4e5e6", 
						"height": h - yScale(maxBGValue)
					}
				];
			}
			var backgroundGroup = svg.selectAll(".background-group")
										.data(backgroundColorGroup)
					   	  				.enter()
										.append("rect")
									    .attr("width", w)
									    .attr("height", function(d,i) {
									    	return d.height;
									    })
									    .attr("fill", function(d,i) {return d.color;})
									    .attr("transform", function(d,i) {
									    	return "translate(" + ( margin.left ) + ","+ ( h + margin.top - d.height ) +")"
									    });

			// //draw vertical background, mark meal time
			// var verticalBackgroundTimePeriod = [
			// 	{
			// 		"start": format("8:30:00 AM"),
			// 		"end": format("10:00:00 AM")
			// 	},
			// 	{
			// 		"start": format("12:00:00 PM"),
			// 		"end": format("1:30:00 PM")
			// 	},
			// 	{
			// 		"start": format("5:30:00 PM"),
			// 		"end": format("7:30:00 PM")
			// 	}
			// ];



			// var verticalBackgroundGroup = svg.selectAll(".background-group")
			// 							.data(verticalBackgroundTimePeriod)
			// 		   	  				.enter()
			// 							.append("rect")
			// 						    .attr("height", h)
			// 						    .attr("width", function(d,i) {
			// 						    	return xScale(d.end) - xScale(d.start);
			// 						    })
			// 						    .attr("fill", "#ffffff")
			// 						    .attr('fill-opacity', '0.6')
			// 						    .attr("transform", function(d,i) {
			// 						    	return "translate(" + ( margin.left + xScale(d.start) ) + ","+ ( margin.top ) +")"
			// 						    });



			// draggable rect, for adjust daily time period
			// var drag = d3.behavior.drag()
			//     .on("drag", dragmove);

			var dragright = d3.behavior.drag()
			    .on("drag", rdragresize);

			var dragleft = d3.behavior.drag()
			    .on("drag", ldragresize);

			var dragRectBreakfastSet = svg.append("g").attr('class', 'rect-breakfast');
			var dragRectBreakfastRect = dragRectBreakfastSet.append("rect")
							    .attr("height", h)
							    .attr("width", function(d,i) {
							    	return xScale(format("10:00:00 AM")) - xScale(format("8:30:00 AM"));
							    })
							    .attr("fill", "#ffffff")
							    .attr('fill-opacity', '0.6')
							    .attr('y', margin.top)
							    .attr('x', xScale(format("8:30:00 AM")) + margin.left);
			var dragRectBreakfastLeft = dragRectBreakfastSet.append("g").attr('class', 'draglineleft')
										.call(dragleft);
			var dragRectBreakfastLeftLine = dragRectBreakfastLeft.append("line")
										.attr('x1', xScale(format("8:30:00 AM")) + margin.left)
										.attr('y1', margin.top)
										.attr('x2', xScale(format("8:30:00 AM")) + margin.left)
										.attr('y2', h + margin.top)
										.attr("stroke-width", 2)
								        .attr("stroke", "#4AA5B8")
								        .attr("cursor", "ew-resize");
			
			// var dragRectBreakfastLeftLineRect = dragRectBreakfastLeft.append("rect")
			// 											.attr('width', 80)
			// 											.attr('height', 30)
			// 											.attr('fill', '#4AA5B8')
			// 											.attr('x', xScale(format("8:30:00 AM")) + margin.left - 40)
			// 											.attr('y', h + margin.top - 30)
			// 											.attr("cursor","pointer");
			// var dragRectBreakfastLeftLineTime = dragRectBreakfastLeft.append("text")
			// 											.text("08:30 AM")
			// 											.attr('fill', '#ffffff')
			// 											.attr('x', xScale(format("8:30:00 AM")) + margin.left - 30)
			// 											.attr('y', h + margin.top - 10)
			// 											.attr("cursor", "pointer");
			var dragRectBreakfastRight = dragRectBreakfastSet.append("g").attr('class', 'draglineright')
										.call(dragright);
			var dragRectBreakfastRightLine = dragRectBreakfastRight.append("line")
										.attr('x1', xScale(format("10:00:00 AM")) + margin.left)
										.attr('y1', margin.top)
										.attr('x2', xScale(format("10:00:00 AM")) + margin.left)
										.attr('y2', h + margin.top)
										.attr("stroke-width", 2)
								        .attr("stroke", "#4AA5B8")
								        .attr("cursor", "ew-resize");

			function dragmove(d) {
				// var x, y;
				// if(d3.event.x < margin.left) {
				// 	x = margin.left;
				// }
				// else if(d3.event.x > margin.left + w) {
				// 	x = margin.left + w;
				// }
				// else {
				// 	x = d3.event.x;
				// }
				// if(d3.event.y < margin.top) {
				// 	y = margin.top + 15;
				// }
				// else if(d3.event.y > margin.top + h) {
				// 	y = margin.top + h - 15;
				// }
				// else {
				// 	y = d3.event.y;
				// }
				
				// // var coords = d3.mouse(this);
				// dragRectBreakfastLeftLine.attr('x1', x).attr('x2', x);
				// dragRectBreakfastLeftLineTime.text(d3.time.format("%I:%M %p")(xScale.invert(x - margin.left)))
				// 					.attr('x', x - 30)
				// 					.attr('y', y + 5)
				// 					.attr('fill','#ffffff');
				// dragRectBreakfastLeftLineRect.attr('x', x - 40)
				// 					.attr('y', y - 15);

			}

			function ldragresize() {
				var breakfastRectWidth = dragRectBreakfastRect.attr('width');
				var newX = Math.max(xScale(format("6:30:00 AM")) + margin.left, Math.min( parseInt(dragRectBreakfastRect.attr('x')) + parseInt(breakfastRectWidth), d3.event.x ) ); 
				//console.log(newX)
				breakfastRectWidth = parseInt(breakfastRectWidth) + parseInt(dragRectBreakfastRect.attr('x')) - parseInt(newX); 
				dragRectBreakfastLeftLine.attr('x1', newX).attr('x2', newX);
				//console.log(breakfastRectWidth)
				dragRectBreakfastRect.attr('x', newX)
										.attr('width', breakfastRectWidth);
			}

			function rdragresize() {
				var breakfastRectWidth = dragRectBreakfastRect.attr('width');
				var newX = Math.max(dragRectBreakfastRect.attr('x'), Math.min( xScale(format("11:00:00 AM")) + margin.left, d3.event.x) ); 
				//console.log(newX)
				breakfastRectWidth = newX - dragRectBreakfastRect.attr('x');
				dragRectBreakfastRightLine.attr('x1', newX).attr('x2', newX);

				dragRectBreakfastRect.attr('width', breakfastRectWidth);
			}

			// // draw background lines
			// svg.append("line")
			// 	.attr('x1', xScale(format("8:30:00 AM")) + margin.left)
			// 	.attr('y1', h + margin.top)
			// 	.attr('x2', xScale(format("8:30:00 AM")) + margin.left)
			// 	.attr('y2', margin.top)
			// 	.attr("stroke-width", 2)
		 //        .attr("stroke", "#dbdcdd");
		  //   svg.append("line")
				// .attr('x1', xScale(format("10:00:00 AM")) + margin.left)
				// .attr('y1', h + margin.top)
				// .attr('x2', xScale(format("10:00:00 AM")) + margin.left)
				// .attr('y2', margin.top)
				// .attr("stroke-width", 2)
		  //       .attr("stroke", "#dbdcdd");
		  //   svg.append("line")
				// .attr('x1', xScale(format("12:00:00 PM")) + margin.left)
				// .attr('y1', h + margin.top)
				// .attr('x2', xScale(format("12:00:00 PM")) + margin.left)
				// .attr('y2', margin.top)
				// .attr("stroke-width", 2)
		  //       .attr("stroke", "#dbdcdd");
		  //   svg.append("line")
				// .attr('x1', xScale(format("1:30:00 PM")) + margin.left)
				// .attr('y1', h + margin.top)
				// .attr('x2', xScale(format("1:30:00 PM")) + margin.left)
				// .attr('y2', margin.top)
				// .attr("stroke-width", 2)
		  //       .attr("stroke", "#dbdcdd");
		  //   svg.append("line")
				// .attr('x1', xScale(format("5:30:00 PM")) + margin.left)
				// .attr('y1', h + margin.top)
				// .attr('x2', xScale(format("5:30:00 PM")) + margin.left)
				// .attr('y2', margin.top)
				// .attr("stroke-width", 2)
		  //       .attr("stroke", "#dbdcdd");
		  //   svg.append("line")
				// .attr('x1', xScale(format("7:30:00 PM")) + margin.left)
				// .attr('y1', h + margin.top)
				// .attr('x2', xScale(format("7:30:00 PM")) + margin.left)
				// .attr('y2', margin.top)
				// .attr("stroke-width", 2)
		  //       .attr("stroke", "#dbdcdd");
		    // border right
		    svg.append("line")
				.attr('x1', margin.left + w)
				.attr('y1', h + margin.top)
				.attr('x2', margin.left + w)
				.attr('y2', margin.top)
				.attr("stroke-width", 3)
		        .attr("stroke", "#babcbf");
		    // border top
		    svg.append("line")
				.attr('x1', margin.left)
				.attr('y1', margin.top)
				.attr('x2', margin.left + w)
				.attr('y2', margin.top)
				.attr("stroke-width", 3)
		        .attr("stroke", "#babcbf");
		    // dashed line 70
		    svg.append("line")
				.attr('x1', margin.left)
				.attr('y1', yScale(70) + margin.top)
				.attr('x2', margin.left + w)
				.attr('y2',  yScale(70) + margin.top)
				.attr("stroke-width", 2)
		        .attr("stroke", "#b2d1dc")
		        .style("stroke-dasharray", ("3, 3"));
		    // dashed line 180
		    svg.append("line")
				.attr('x1', margin.left)
				.attr('y1', yScale(180) + margin.top)
				.attr('x2', margin.left + w)
				.attr('y2',  yScale(180) + margin.top)
				.attr("stroke-width", 2)
		        .attr("stroke", "#b2d1dc")
		        .style("stroke-dasharray", ("3, 3"));



		    // draw axis
		    svg.append("g")
		    	.attr("class", "axis")
		    	.attr("transform", "translate("+ margin.left +"," + ( h + margin.top ) + ")")
		    	.transition()
			    .duration(500)
		    	.call(xAxis);

		   	svg.append("g")
			    .attr("class","axis")
			    .attr("transform", "translate(" + ( margin.left ) + ","+ margin.top +")")
			    .transition()
			    .duration(500)
			    .call(yAxis);


			


			// write "Breakfast", "Lunch" and "Dinner"
			svg.append("text")
				.text("Breakfast")
				.attr('x', xScale(format("8:30:00 AM")) + margin.left )
				.attr('y', margin.top + 20)
				.attr('fill', '#939496');
			svg.append("text")
				.text("Lunch")
				.attr('x', xScale(format("12:00:00 PM")) + margin.left + 10)
				.attr('y', margin.top + 20)
				.attr('fill', '#939496');
			svg.append("text")
				.text("Dinner")
				.attr('x', xScale(format("5:30:00 PM")) + margin.left + 20)
				.attr('y', margin.top + 20)
				.attr('fill', '#939496');


			

			// draw top line trend
			var maximumAverageBGValue = 0;
			var averageBGValue = 0;
			var countAverage = 0;
			//minimumAverageBGValue = datasetByDate[0].Value[0].BGValue;
			for(var i = 0; i < datasetTopGraph.length;i++) {
				countAverage = 0;
				for(var j = 0; j < datasetTopGraph[i].Value.length; j++) {
					if(datasetTopGraph[i].Value[j].Used != "0") {
						averageBGValue = averageBGValue + parseInt(datasetTopGraph[i].Value[j].BGValue);
					}	
					else {
						countAverage ++;
					}
				}
				if(countAverage == datasetTopGraph[i].Value.length) {
					if(i != 0) {
						averageBGValue = datasetTopGraph[i-1].AverageBGValue;
					}
					else {
						averageBGValue = 0;
					}
				}
				else {
					averageBGValue = averageBGValue /  datasetTopGraph[i].Value.length;
				}
				
				datasetTopGraph[i].AverageBGValue = averageBGValue;
				if(maximumAverageBGValue < averageBGValue) {
					maximumAverageBGValue = averageBGValue;
				}
				//console.log(averageBGValue)
				averageBGValue = 0;
			}
			if(maximumAverageBGValue < 180) {
				maximumAverageBGValue = 180;
			}
			//console.log(maximumAverageBGValue)

			var topFormat = d3.time.format("%m/%e/%y").parse;

			xTopGraphScale = d3.time.scale()
							.domain([topFormat(datasetTopGraph[0].Date),topFormat(datasetTopGraph[datasetTopGraph.length-1].Date)])
							.range([0,w]);

			yTopGraphScale = d3.scale.linear()
				    .domain([0,maximumAverageBGValue])
				    .rangeRound([margin.top/2,0]);


		    xTopAxis = d3.svg.axis()
		                  .scale(xTopGraphScale)
		                  .orient("bottom")
		                  .ticks(8);

			svg.append("g")
		    	.attr("class", "axis topAxis")
		    	.attr("transform", "translate("+ margin.left +"," + (margin.top/4 ) + ")")
		    	.transition()
			    .duration(500)
		    	.call(xTopAxis);

		   	var lDate,
		   		rDate = topFormat(datasetTopGraph[datasetTopGraph.length-1].Date);
		   	if(datasetTopGraph.length > 14) {
		   		lDate = topFormat(datasetTopGraph[datasetTopGraph.length-14].Date);
		   	}
		   	else {
		   		lDate = topFormat(datasetTopGraph[0].Date);
		   	}
			
			//Declaring the brush 				
			brush = d3.svg.brush()
						.x(xTopGraphScale)
						.extent([lDate, rDate])
						.on("brush", brushed);

			//Appends a brush over the svg region	
			var b = svg.append("g")
					.attr("class", "x brush")
					.attr('transform', "translate("+ margin.left +"," + (margin.top/2 ) + ")");
			
	        //Adding visible left and right circle handles    
	        var leftHandle = b.append("svg:circle")
				.attr("r", 7)
	            .attr("cx",150)
				.attr("cy",25)
				.attr('fill', "#676767");
				
	        var rightHandle = b.append("svg:circle")
				.attr("r", 7)
				.attr("cx",175)
				.attr("cy",25)
				.attr('fill', "#676767");
			
	        //makes sure that dragging the circles (handles) calls the brush function... otherwise dragging is broken in that region.    
	        b.call(brush);
				
	        b.selectAll("rect")
				.attr("y", -4)
				.attr("height", 58)
				.attr('opacity', 0.2);
	            
			b.selectAll(".resize.e rect").attr("width", 25).attr("x", -5);
			b.selectAll(".resize.w rect").attr("width", 25).attr("x", -5);

			

			//Allows brushing over the mini timeline and helps selecting a particular
			//section of the timeline
			function brushed() {
				leftHandle.attr("cx", function() {
					// console.log(brush.extent()[0])
					// console.log(topFormat(dataset[0].Date))
					return xTopGraphScale(brush.extent()[0]) + 1; 
				});
				rightHandle.attr("cx", function() {
					return xTopGraphScale(brush.extent()[1]) - 1 ; 
				});

				d3.selectAll(".sidebar").remove();
				d3.selectAll(".text-percentage").remove();
				d3.selectAll(".line-group").remove();
				d3.selectAll(".hollow").remove();
				d3.selectAll(".last-line").remove();
				d3.selectAll(".last-dot").remove();
				$(".tooltip-last-day").remove();

				updateLineChart();
			}
			
			brushed();


			function updateLineChart() {
				var slicedDataset, slicedDatasetByDate;
				var datasetStart = 0, datasetEnd = dataset.length - 1, datasetByDateStart = 0, datasetByDateEnd = datasetByDate.length - 1;
				for(var i = 0; i < dataset.length; i++) {
					if(dataset[i].Date != "" && topFormat(dataset[i].Date).getTime() >= brush.extent()[0].getTime()) {
						datasetStart = i;
						break;
					}
				}
				for(var i = dataset.length - 1; i >= 0; i--) {
					if(dataset[i].Date != "" && topFormat(dataset[i].Date).getTime() <= brush.extent()[1].getTime()) {
						datasetEnd = i;
						break;
					}
				}
				
				slicedDataset = dataset.slice(datasetStart,datasetEnd + 1);
				//console.log(slicedDataset);
				// console.log(dataset)

				for(var i = 0; i < datasetByDate.length; i++) {
					if(topFormat(datasetByDate[i].Date).getTime() >= brush.extent()[0].getTime()) {
						datasetByDateStart = i;
						break;
					}
					else {
						datasetByDateStart = 0;
					}
				}
				//console.log(topFormat(datasetByDate[i].Date))
				for(var i = datasetByDate.length - 1; i >= 0; i--) {
					if(topFormat(datasetByDate[i].Date).getTime() <= brush.extent()[1].getTime()) {
						datasetByDateEnd = i;
						break;
					}
					else {
						datasetByDateEnd = 0;
					}
				}
				
				slicedDatasetByDate = datasetByDate.slice(datasetByDateStart,datasetByDateEnd + 1);
				//console.log(slicedDatasetByDate)
				console.log(datasetByDate)

				BGValuePercentage[0].value = 0;
				BGValuePercentage[1].value = 0;
				BGValuePercentage[2].value = 0;
				BGValuePercentage[3].value = 0;
				BGValuePercentage[4].value = 0;

				for(var i = 0; i < slicedDataset.length; i++){

		    		// get percentage
		    		if(parseInt(slicedDataset[i].BGValue) < 70) {
		    			BGValuePercentage[0].value ++;
		    		}
		    		if(parseInt(slicedDataset[i].BGValue) >= 70 && parseInt(slicedDataset[i].BGValue) <= 180) {
		    			BGValuePercentage[1].value ++;
		    		}
		    		if(parseInt(slicedDataset[i].BGValue) > 300) {
		    			BGValuePercentage[4].value ++;
		    		}
		    		if(parseInt(slicedDataset[i].BGValue) > 250) {
		    			BGValuePercentage[3].value ++;
		    		}
		    		if(parseInt(slicedDataset[i].BGValue) > 180) {
		    			BGValuePercentage[2].value ++;
		    		}
				}


				// sidebar
				var sidebarGroup;

				if(maxBGValue > 300) {
					sidebarGroup = [
						{
							"color": colorUnder70, 
							"height": h - yScale(70),
							"yStart": margin.top + yScale(70),
							"value": BGValuePercentage[0].value / slicedDataset.length
						},
						{
							"color": colorBetween70To180, 
							"height": yScale(70) - yScale(180),
							"yStart": margin.top + yScale(180),
							"value": BGValuePercentage[1].value / slicedDataset.length
						},
						{
							"color": colorBetween180To250, 
							"height": yScale(180),
							"yStart": margin.top,
							"value": BGValuePercentage[2].value / slicedDataset.length
						},
						{
							"color": colorBetween250To300, 
							"height": yScale(250),
							"yStart": margin.top,
							"value": BGValuePercentage[3].value / slicedDataset.length
						},
						{
							"color": colorOver300, 
							"height": yScale(300) - yScale(maxBGValue),
							"yStart": margin.top,
							"value": BGValuePercentage[4].value / slicedDataset.length
						}
					];
				}
				else if(maxBGValue <= 300 && maxBGValue > 250) {
					sidebarGroup = [
						{
							"color": colorUnder70, 
							"height": h - yScale(70),
							"yStart": margin.top + yScale(70),
							"value": BGValuePercentage[0].value / slicedDataset.length
						},
						{
							"color": colorBetween70To180, 
							"height": yScale(70) - yScale(180),
							"yStart": margin.top + yScale(180),
							"value": BGValuePercentage[1].value / slicedDataset.length
						},
						{
							"color": colorBetween180To250, 
							"height": yScale(180),
							"yStart": margin.top,
							"value": BGValuePercentage[2].value / slicedDataset.length
						},
						{
							"color": colorBetween250To300, 
							"height": yScale(250) - yScale(maxBGValue),
							"yStart": margin.top,
							"value": BGValuePercentage[3].value / slicedDataset.length
						}
					];
				}
				else if(maxBGValue <= 250 && maxBGValue > 180) {
					sidebarGroup = [
						{
							"color": colorUnder70, 
							"height": h - yScale(70),
							"yStart": margin.top + yScale(70),
							"value": BGValuePercentage[0].value / slicedDataset.length
						},
						{
							"color": colorBetween70To180, 
							"height": yScale(70) - yScale(180),
							"yStart": margin.top + yScale(180),
							"value": BGValuePercentage[1].value / slicedDataset.length
						},
						{
							"color": colorBetween180To250, 
							"height": yScale(180) - yScale(maxBGValue),
							"yStart": margin.top,
							"value": BGValuePercentage[2].value / slicedDataset.length
						}
					];
				}
				else if(maxBGValue <= 180 && maxBGValue > 70) {
					sidebarGroup = [
						{
							"color": colorUnder70, 
							"height": h - yScale(70),
							"yStart": margin.top + yScale(70),
							"value": BGValuePercentage[0].value / slicedDataset.length
						},
						{
							"color": colorBetween70To180, 
							"height": yScale(70) - yScale(180),
							"yStart": margin.top,
							"value": BGValuePercentage[1].value / slicedDataset.length
						}
					];
				}
				else {
					sidebarGroup = [
						{
							"color": colorUnder70, 
							"height": h - yScale(70),
							"yStart": margin.top,
							"value": BGValuePercentage[0].value / slicedDataset.length
						}
					];
				}


				svg.selectAll("rect.sidebar")
			    	.data(sidebarGroup)
				    .enter()
				    .append("rect")
				    .attr('class', 'sidebar')
				    .attr("x", function(d){return margin.left + w;})
				    .attr("y", function(d){return d.yStart;})
				    .attr("width", function(d){
				    	if(d.value * 100 < 10 && d.value * 100 > 0) {
				    		return d.value + 10;
				    	}
				    	//console.log(d.value * 100)
				    	return d.value * 100;
				    })
				    .attr("height", function(d){return d.height;})
				    .attr("fill", function(d){return d.color;});

				for(var i = 0; i < BGValuePercentage.length; i ++) {
					BGValuePercentage[i].value = (BGValuePercentage[i].value / slicedDataset.length * 100).toFixed(2);
					if(BGValuePercentage[i].value > 0) {
						svg.append("text")
							.attr('class', 'text-percentage')
							.text(BGValuePercentage[i].value + "% " + BGValuePercentage[i].category)
							.attr('x', w + margin.left + 10 )
							.attr('y', margin.top + 20*(5 - i))
							.attr('fill', '#000000');
					}
				}


				// draw circles
				var circle = svg.selectAll(".hollow")
										.data(slicedDataset)
										.enter()
										.append("circle")
										.attr('class', 'hollow');
				circle.attr('cx', function(d,i){
							return xScale(format(d.Time)) + margin.left;
						})
						.attr('cy', function(d,i){
							return yScale(d.BGValue) + margin.top;
						})
						.attr('r', function(d,i){
							if(d.Used == "0") {
								return 5;
							}
						})
						.attr('fill', function(d,i){
							if(d.Used == "0") {
								return "#ffffff";
							}
							
						})
						//.attr('fill-opacity', 0.75)
						.attr('opacity', .5)
						.attr('stroke', function(d,i){
							if(d.Used == "0") {
								if(parseInt(d.BGValue) < 70) { return colorUnder70; }
								else if(parseInt(d.BGValue) >=70 && parseInt(d.BGValue) <= 180) { return colorBetween70To180;}
								else if(parseInt(d.BGValue) >180 && parseInt(d.BGValue) <= 250) { return colorBetween180To250;}
								else if(parseInt(d.BGValue) >250 && parseInt(d.BGValue) <= 300) { return colorBetween250To300;}
								else { return colorOver300; }
							}
							
						})
						.attr('stroke-width', function(d,i){
							if(d.Used == "0") {
								return 3;
							}
						})
						.on("mouseover", function(d,i) {
							d3.selectAll(".hollow")
			              		 		.attr('opacity', 0.1);

		          		 	d3.select(this)
		          		 		.transition()
					            .ease("elastic")
					            .duration("500")
		          		 		.attr("r", 10)
		          		 		.attr('opacity', 1);
		          		 	d3.selectAll(".line-group")
			              		 		.attr('opacity', 0.3);

		          		 	div.transition()		
				                .duration(200)		
				                .style("opacity", 1);		
				            div	.html("<strong>Date: </strong>" + d.Date + "<br/>"  + "<strong>Time: </strong>" + d.Time + "<br/>"  + "<strong>Type: </strong>" + d.Type + "<br/>"  + "<strong>BG Value: </strong>" + d.BGValue)	
				                .style("left", (xScale(format(d.Time)) + margin.left - 0.5*$(".tooltip").width() - 12) + "px")		
				                .style("top", (yScale(d.BGValue) - 5) + "px");
				            // console.log($(".tooltip").height())	

				            $(".tooltip-last-day").css({
				            	"opacity": 0
				            });	
			           })
			           .on("mouseout", function(d,i) { 
			           		 d3.select(this)
		          		 		.transition()
					            .ease("elastic")
					            .duration("500")
		          		 		.attr("r", 5)
		          		 		.attr('opacity', 0.5);
		          		 	d3.selectAll(".line-group")
			              		 		.attr('opacity', 1);
			              	d3.selectAll(".hollow")
			              		 		.attr('opacity', 0.5);
		          		 	div.transition()		
				                .duration(200)		
				                .style("opacity", 0)
				                .duration(200)
				                .style("left", 0)
				                .style("top", 0);
				            $(".tooltip-last-day").css({
				            	"opacity": 1
				            });
			           });



			    // draw lines
				var lineFormat = d3.svg.line()
						    .x(function(d) { return xScale(format(d.Time)); })
						    .y(function(d) { return yScale(d.BGValue); });
				if(datasetByDateEnd != 0) {
					var lineGroup = svg.selectAll(".line-group")
							      .data(slicedDatasetByDate)
							   	  .enter()
							   	  .append("g")
							   	  .attr('class','line-group')
							   	  .on("mouseover", function() { 
				              		 	d3.select(this).selectAll("path")
				              		 		.transition()
								            .ease("elastic")
								            .duration("500")
				              		 		.attr("opacity", "1")
				              		 		.attr('stroke-width', '8');
				              		 	d3.selectAll(".hollow")
				              		 		.attr('opacity', 0.1);
				              		 	d3.selectAll(".dot")
				              		 		.attr('opacity', 0.1);
				              		 	d3.select(this).selectAll(".dot")
				              		 		.transition()
								            .ease("elastic")
								            .duration("500")
				              		 		.attr("r", "10")
				              		 		.attr('opacity', 1);
						           })
						           .on("mouseout", function() { 
						           		 d3.select(this).selectAll("path")
						           		 	.transition()
								            .ease("elastic")
								            .duration("500")
						           		 	.attr("opacity", "0.2")
						           		 	.attr('stroke-width', '3');
						           		 d3.selectAll(".hollow")
				              		 		.attr('opacity', 0.5);
				              		 	d3.selectAll(".dot")
				              		 		.attr('opacity', 0.5);
						           		 d3.select(this).selectAll(".dot")
				              		 		.transition()
								            .ease("elastic")
								            .duration("500")
				              		 		.attr("r", "6")
				              		 		.attr('opacity', 0.5);
						           });			


			        var line = lineGroup.append("path")
			        	      .attr("d", function(d) { return lineFormat(d.Value); })
						      .attr("transform", "translate("+ margin.left +"," + margin.top + ")")
						      .attr("stroke", colorLine)
				              .attr("stroke-width", 3)
				              .attr("fill", "none")
				              .attr("opacity", "0.2");  
				             
					var circleGroup = lineGroup.append("g")
								.selectAll(".dot")
								.data(function(d) { return d.Value; })
								.enter()
								.append("circle")
								.attr('cx', function(d,i){
									return xScale(format(d.Time)) + margin.left;
								})
								.attr('cy', function(d,i){
									return yScale(d.BGValue) + margin.top;
								})
								.attr('r',  '6')
								.attr('fill', function(d,i){
									if(parseInt(d.BGValue) < 70) { return colorUnder70; }
									else if(parseInt(d.BGValue) >=70 && parseInt(d.BGValue) <= 180) { return colorBetween70To180;}
									else if(parseInt(d.BGValue) >180 && parseInt(d.BGValue) <= 250) { return colorBetween180To250;}
									else if(parseInt(d.BGValue) >250 && parseInt(d.BGValue) <= 300) { return colorBetween250To300;}
									else { return colorOver300; }

									
								})
								.attr('opacity', 0.5)
								.attr('class', 'dot')
								.on("mouseover", function(d,i) { 
				          		 	div.transition()		
						                .duration(200)		
						                .style("opacity", 1);		
						            div	.html("<strong>Date: </strong>" + d.Date + "<br/>"  + "<strong>Time: </strong>" + d.Time + "<br/>"  + "<strong>Type: </strong>" + d.Type + "<br/>"  + "<strong>BG Value: </strong>" + d.BGValue)	
						                .style("left", (xScale(format(d.Time)) + margin.left - 0.5*$(".tooltip").width() - 12) + "px")		
						                .style("top", (yScale(d.BGValue) - 5) + "px");
						            // console.log($(".tooltip").height())	
						            $(".tooltip-last-day").css({
						            	"opacity": 0
						            });	
					            })
					            .on("mouseout", function(d,i) { 
					           		div.transition()		
						                .duration(200)		
						                .style("opacity", 0)
						                .duration(200)
						                .style("left", 0)
						                .style("top", 0);
						            $(".tooltip-last-day").css({
						            	"opacity": 1
						            });	
					            });
				}
				

				// emphasis last day
				if(slicedDatasetByDate[slicedDatasetByDate.length-1].Date == datasetByDate[datasetByDate.length-1].Date) {
					console.log(datasetByDate[datasetByDate.length-1])

					var lastLine = svg.append("path")
			        	      .attr("d", function(d) { return lineFormat(datasetByDate[datasetByDate.length-1].Value); })
						      .attr("transform", "translate("+ margin.left +"," + margin.top + ")")
						      .attr("stroke", colorLine)
				              .attr("fill", "none")
				              .attr("opacity", "1")
			              	  .attr('stroke-width', '8')
			              	  .attr('class', 'last-line');

				             
					var lastCircleGroup = svg.selectAll(".last-dot")
								.data(datasetByDate[datasetByDate.length-1].Value)
								.enter()
								.append("circle")
								.attr('cx', function(d,i){
									return xScale(format(d.Time)) + margin.left;
								})
								.attr('cy', function(d,i){
									return yScale(d.BGValue) + margin.top;
								})
								.attr('r',  '10')
								.attr('fill', function(d,i){
									if(parseInt(d.BGValue) < 70) { return colorUnder70; }
									else if(parseInt(d.BGValue) >=70 && parseInt(d.BGValue) <= 180) { return colorBetween70To180;}
									else if(parseInt(d.BGValue) >180 && parseInt(d.BGValue) <= 250) { return colorBetween180To250;}
									else if(parseInt(d.BGValue) >250 && parseInt(d.BGValue) <= 300) { return colorBetween250To300;}
									else { return colorOver300; }

									
								})
								.attr('opacity', 1)
								.attr('class', 'last-dot')
								.on("mouseover", function(d,i) {
									d3.selectAll(".hollow")
					              		 		.attr('opacity', 0.1);
				          		 	d3.selectAll(".line-group")
					              		 		.attr('opacity', 0.3);

				          		 	div.transition()		
						                .duration(200)		
						                .style("opacity", 1);		
						            div	.html("<strong>Date: </strong>" + d.Date + "<br/>"  + "<strong>Time: </strong>" + d.Time + "<br/>"  + "<strong>Type: </strong>" + d.Type + "<br/>"  + "<strong>BG Value: </strong>" + d.BGValue)	
						                .style("left", (xScale(format(d.Time)) + margin.left - 0.5*$(".tooltip").width() - 12) + "px")		
						                .style("top", (yScale(d.BGValue) - 5) + "px");
						            $(".tooltip-last-day").css({
						            	"opacity": 0
						            });		
					           })
					           .on("mouseout", function(d,i) { 
				          		 	d3.selectAll(".line-group")
					              		 		.attr('opacity', 1);
					              	d3.selectAll(".hollow")
					              		 		.attr('opacity', 0.5);
				          		 	div.transition()		
						                .duration(200)		
						                .style("opacity", 0)
						                .duration(200)
						                .style("left", 0)
						                .style("top", 0);
						            $(".tooltip-last-day").css({
						            	"opacity": 1
						            });
						        });


					// last day dots tooltip
					var divLastDay = d3.select("#svg").append("div")	
							    .attr("class", "tooltip tooltip-last-day");

					var lastDayIndex = datasetByDate[datasetByDate.length-1].Value.length - 1;
					
					divLastDay.html("<strong>Date: </strong>" + datasetByDate[datasetByDate.length-1].Date + "<br/>"  + "<strong>Time: </strong>" + datasetByDate[datasetByDate.length-1].Value[lastDayIndex].Time + "<br/>"  + "<strong>Type: </strong>" + datasetByDate[datasetByDate.length-1].Value[lastDayIndex].Type + "<br/>"  + "<strong>BG Value: </strong>" + datasetByDate[datasetByDate.length-1].Value[lastDayIndex].BGValue)	
			                .style("left", (xScale(format(datasetByDate[datasetByDate.length-1].Value[lastDayIndex].Time)) + margin.left - 0.5*96 - 12) + "px")		
			                .style("top", (yScale(datasetByDate[datasetByDate.length-1].Value[lastDayIndex].BGValue) - 5) + "px")
			                .style("opacity",1);


				}



				
			}

			// draw dashed lines
			svg.append("line")
				.attr('x1', margin.left)
				.attr('y1', yTopGraphScale(70) + margin.top/2)
				.attr('x2', margin.left + w)
				.attr('y2',  yTopGraphScale(70) + margin.top/2)
				.attr("stroke-width", 2)
		        .attr("stroke", "#b2d1dc")
		        .attr("stroke-dasharray", ("3, 3"));
		    svg.append("line")
				.attr('x1', margin.left)
				.attr('y1', yTopGraphScale(180) + margin.top/2)
				.attr('x2', margin.left + w)
				.attr('y2',  yTopGraphScale(180) + margin.top/2)
				.attr("stroke-width", 2)
		        .attr("stroke", "#b2d1dc")
		        .attr("stroke-dasharray", ("3, 3"));


			// draw top line
			var averageBGValueLineFormat = d3.svg.line()
						.interpolate("basis") 
					    .x(function(d) { return xTopGraphScale(topFormat(d.Date)); })
					    .y(function(d) { return yTopGraphScale(d.AverageBGValue); });
	        
	        var averageLineGraph = svg.append("path")
	        		  .datum(datasetTopGraph)
	        	      .attr("d", function(d) { return averageBGValueLineFormat(d); })
				      .attr("transform", "translate("+ margin.left +", " + margin.top/2 + ")")
				      .attr("stroke", "#000000")
		              .attr("stroke-width", 2)
		              .attr("fill", "none");



		});  
	}
});