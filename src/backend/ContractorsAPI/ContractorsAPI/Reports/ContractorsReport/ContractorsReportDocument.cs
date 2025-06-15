using ContractorsAPI.Model.Reports;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace ContractorsAPI.Reports.ContractorsReport
{
    public class ContractorsReportDocument : IDocument
    {
        private ContractorsReportData _data;

        public ContractorsReportDocument(ContractorsReportData data)
        {
            _data = data;
        }

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Margin(50);

                page.Header().Element(ComposeHeader);
                page.Content().Element(ComposeContent);
                page.Footer().AlignCenter().Text(x =>
                {
                    x.CurrentPageNumber();
                    x.Span(" / ");
                    x.TotalPages();
                });
            });
        }

        private void ComposeHeader(IContainer container)
        {
            container.Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item()
                        .Text($"Date: {_data.CurrentTime:d}")
                        .FontSize(20).SemiBold().FontColor(Colors.Blue.Medium);

                    column.Item().Text(text =>
                    {
                        text.Span($"User: ").SemiBold();
                        text.Span($"{_data.User.UserName}");
                    });
                });

                row.ConstantItem(100).Height(50).Placeholder();
            });
        }

        private void ComposeContent(IContainer container)
        {
            container
                .PaddingVertical(40)
                .Height(250)
                .Background(Colors.Grey.Lighten3)
                .AlignCenter()
                .Padding(20)
                .Column(column =>
                {
                    column.Item().Text("Contractors List").FontSize(18).Bold().AlignCenter();

                    foreach (var contractor in _data.Contractors)
                    {
                        column.Item().PaddingTop(15).Border(1).BorderColor(Colors.Grey.Medium)
                            .Background(Colors.White).Padding(15)
                            .Column(itemColumn =>
                            {
                                // Main item info
                                itemColumn.Item().Row(row =>
                                {
                                    //row.RelativeItem().Text($"ID: {contractor.Id}").FontSize(12).Bold();
                                    row.RelativeItem().AlignRight().Text($"User ID: {contractor.UserId}").FontSize(12).Bold();
                                });

                                itemColumn.Item().PaddingTop(5).Text($"Name: {contractor.Name}").FontSize(14).Bold();
                                itemColumn.Item().PaddingTop(3).Text($"Description: {contractor.Description}").FontSize(11);

                                // Additional Data for this item
                                if (contractor.AdditionalData?.Any() == true)
                                {
                                    itemColumn.Item().PaddingTop(10).Text("Additional Data:").FontSize(10).Bold().Underline();

                                    itemColumn.Item().PaddingTop(5).Table(table =>
                                    {
                                        table.ColumnsDefinition(columns =>
                                        {
                                            columns.RelativeColumn(2);
                                            columns.RelativeColumn(1);
                                            columns.RelativeColumn(3);
                                        });

                                        // Small table headers
                                        table.Header(header =>
                                        {
                                            header.Cell().Background(Colors.Grey.Lighten1).Padding(3).Text("Field").FontSize(8).Bold();
                                            header.Cell().Background(Colors.Grey.Lighten1).Padding(3).Text("Type").FontSize(8).Bold();
                                            header.Cell().Background(Colors.Grey.Lighten1).Padding(3).Text("Value").FontSize(8).Bold();
                                        });

                                        foreach (var additionalItem in contractor.AdditionalData)
                                        {
                                            table.Cell().Border(0.5f).Padding(2).Text(additionalItem.FieldName).FontSize(8);
                                            table.Cell().Border(0.5f).Padding(2).Text(additionalItem.FieldType).FontSize(8);
                                            table.Cell().Border(0.5f).Padding(2).Text(additionalItem.FieldValue ?? "N/A").FontSize(8);
                                        }
                                    });
                                }
                            });
                    }
                });
        }
    }
}
