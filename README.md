# rapise-vantagepoint

Rapise Framework for testing Deltek Vantagepoint

## VpReport Object

### GetValue

- **anchor** - text value of a report cell
- **index** - if anchor is found several times, use index to get the right one
- **colOffset** - column offset, non-negative integer
- **rowOffset** - row offset, non-negative integer

Returns text value of the cell.

### Save

- **fileName** - name of the file to save full report contents
