package com.macrosoft.utilities;

import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;

import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTTcPr;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTVMerge;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTHMerge;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STMerge;

public class CreateWordTableMerge {

public static void mergeCellVertically(XWPFTable table, int col, int fromRow, int toRow) {
  for(int rowIndex = fromRow; rowIndex <= toRow; rowIndex++){
   XWPFTableCell cell = table.getRow(rowIndex).getCell(col);
   CTVMerge vmerge = CTVMerge.Factory.newInstance();
   if(rowIndex == fromRow){
    // The first merged cell is set with RESTART merge value
    vmerge.setVal(STMerge.RESTART);
   } else {
    // Cells which join (merge) the first one, are set with CONTINUE
    vmerge.setVal(STMerge.CONTINUE);
    // and the content should be removed
    for (int i = cell.getParagraphs().size(); i > 0; i--) {
     cell.removeParagraph(0);
    }
    cell.addParagraph();
   }
   // Try getting the TcPr. Not simply setting an new one every time.
   CTTcPr tcPr = cell.getCTTc().getTcPr();
   if (tcPr != null) {
    tcPr.setVMerge(vmerge);
   } else {
    // only set an new TcPr if there is not one already
    tcPr = CTTcPr.Factory.newInstance();
    tcPr.setVMerge(vmerge);
    cell.getCTTc().setTcPr(tcPr);
   }
  }
 }

 public static void mergeCellHorizontally(XWPFTable table, int row, int fromCol, int toCol) {
  for(int colIndex = fromCol; colIndex <= toCol; colIndex++){
   XWPFTableCell cell = table.getRow(row).getCell(colIndex);
   CTHMerge hmerge = CTHMerge.Factory.newInstance();
   if(colIndex == fromCol){
    // The first merged cell is set with RESTART merge value
    hmerge.setVal(STMerge.RESTART);
   } else {
    // Cells which join (merge) the first one, are set with CONTINUE
    hmerge.setVal(STMerge.CONTINUE);
    // and the content should be removed
    for (int i = cell.getParagraphs().size(); i > 0; i--) {
     cell.removeParagraph(0);
    }
    cell.addParagraph();
   }
   // Try getting the TcPr. Not simply setting an new one every time.
   CTTcPr tcPr = cell.getCTTc().getTcPr();
   if (tcPr != null) {
    tcPr.setHMerge(hmerge);
   } else {
    // only set an new TcPr if there is not one already
    tcPr = CTTcPr.Factory.newInstance();
    tcPr.setHMerge(hmerge);
    cell.getCTTc().setTcPr(tcPr);
   }
  }
 }
}
