namespace ContractorsAPI.Model.Common
{
    public record PaginatedData<T>(IEnumerable<T> Data, int Page, int Count, int TotalCount, int TotalPages);
}
