// Put library code here

var _reportModels = {};

function _Log(msg)
{
	Tester.Message(msg);
}

function _GetReportModel(xpath)
{
	if (typeof(_reportModels[xpath]) != "undefined")
	{
		return _reportModels[xpath];
	}

	var model = 
	{
		rowsDic: {},
		colsDic: {},
		rowsOn: [],
		colsOn: [],
		tableData: {}
	};
	
	var cells = Navigator.DOMFindByXPath(xpath, true);
	if (cells)
	{
		if (l3) _Log("Cells count: " + cells.length);
			
		for(var i = 0; i < cells.length; i++)
		{
			var cell = cells[i];
			var rect = cell.rect;
			
			if (l3) _Log("Rect: " + rect.x + ", " + rect.y + ", " + rect.w + ", " + rect.h);
			
			if (typeof(model.rowsDic[rect.y]) == "undefined")
			{
				model.rowsDic[rect.y] = 1;
				model.rowsOn.push(rect.y);
			}
			
			if (typeof(model.colsDic[rect.x]) == "undefined")
			{
				model.colsDic[rect.x] = 1;
				model.colsOn.push(rect.x);
			}
			
			var key = rect.x + "," + rect.y;
			model.tableData[key] = cell;
		}
		
		function compareNumbers(a, b) 
		{
			return a - b;
		}		
		
		model.rowsOn = model.rowsOn.sort(compareNumbers);
		model.colsOn = model.colsOn.sort(compareNumbers);
		
		if (l3) _Log("Rows count: " + model.rowsOn.length);
		if (l3) _Log("Cols count: " + model.colsOn.length);
		
		if (l3) _Log("Rows: " + model.rowsOn.join(","));
		if (l3) _Log("Cols: " + model.colsOn.join(","));
		
		for(var i = 0; i < model.rowsOn.length; i++)
		{
			model.rowsDic[model.rowsOn[i]] = i;
		}
		
		for(var i = 0; i < model.colsOn.length; i++)
		{
			model.colsDic[model.colsOn[i]] = i;
		}
	}

	_reportModels[xpath] = model;
	
	return model;
}

function VpReport_GetValue(/**string*/ anchor, /**number*/ index, /**number*/ colOffset, /**number*/ rowOffset)
{
	colOffset = colOffset || 0;
	rowOffset = rowOffset || 0;

	var anchorObjs = Navigator.DOMFindByXPath("//td[.//text()='" + anchor + "' and not(.//td)]", true);
	if (anchorObjs)
	{
		if (l3) _Log("Anchors found: " + anchorObjs.length);
	
		if (index < anchorObjs.length)
		{
			var anchorObj = anchorObjs[index];
			
			anchorObj.highlight();
			
			var model = _GetReportModel("//td[not(.//td) and normalize-space(.//text())!=' ' and normalize-space(.//text())!='' and normalize-space(.//text())!=' ']");
			
			// find the cell
			var anchorRect = anchorObj.rect;
			var anchorRow = model.rowsDic[anchorRect.y];
			var anchorCol = model.colsDic[anchorRect.x];
			
			if (l3) _Log("Anchor Row: " + anchorRow);
			if (l3) _Log("Anchor Col: " + anchorCol);
			
			var cellRow = anchorRow;
			var cellCol = anchorCol;
			
			var colDelta = 1;
			var rowDelta = 1;
			var foundCell = null;
			
			while(colDelta <= colOffset)
			{
				var cellY = model.rowsOn[cellRow];
				var cellX = model.colsOn[++cellCol];
				
				var cellKey = cellX + "," + cellY;
				foundCell = model.tableData[cellKey];
				if (foundCell)
				{
					colDelta++;
				}
			}
			
			while(rowDelta <= rowOffset)
			{
				var cellY = model.rowsOn[++cellRow];
				var cellX = model.colsOn[cellCol];
				
				var cellKey = cellX + "," + cellY;
				foundCell = model.tableData[cellKey];
				if (foundCell)
				{
					rowDelta++;
				}
			}			
			
			if (foundCell)
			{
				foundCell.highlight();
				return foundCell.GetText();
			}
			
			return "";
		}
	}
}

function VpReport_Save(/**string*/ fileName)
{
	var model = _GetReportModel("//td[not(.//td) and normalize-space(.//text())!=' ' and normalize-space(.//text())!='' and normalize-space(.//text())!=' ']");
	var text = "";
	
	for(var i = 0; i < model.rowsOn.length; i++)
	{
		var line = "";
		var prevCellIsText = false;
		for(var j = 0; j < model.colsOn.length; j++)
		{
			var cellY = model.rowsOn[i];
			var cellX = model.colsOn[j];
			
			var cellKey = cellX + "," + cellY;
			foundCell = model.tableData[cellKey];
			if (foundCell)
			{
				if (prevCellIsText)
				{
					line = line + "    ";
				}
				line = line + foundCell.GetText();
				prevCellIsText = true;
			}
			else
			{
				line = line + "    ";
				prevCellIsText = false;
			}
		}
		text = text + line + "\r\n";
	}
	
	File.Write(fileName, text);
}

if (typeof(SeSGlobalObject) != "undefined")
{
	SeSGlobalObject("VpReport");
}