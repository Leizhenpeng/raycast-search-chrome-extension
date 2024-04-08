import { ExtensionMeta } from "@/model/npmResponse.model";
import { usePromise } from "@raycast/utils";
import chromeStoreAPI from "chrome-extension-meta";

export function useSearch(keyword: string | null, pageSize: number) {
  const fetchData = async (searchText: string, page: number) => {
      const actualLimit = page * pageSize;
      const results = await chromeStoreAPI.fullSearch(searchText, actualLimit);
      const data = results.data as unknown as  ExtensionMeta[];
      const items = data.filter(item => item.iconURL);
      const hasMore = items.length === actualLimit;
      return { data: items, hasMore };
  };

  const { isLoading, data, pagination } = usePromise(
      ({ page }) => fetchData(keyword ?? '', page),
      [keyword]
  );

  // 确保传递给 pagination 的对象符合期望的类型
  const paginationConfig = {
      onLoadMore: () => pagination?.onLoadMore(), // 如果需要，调整此处以正确传递当前页码
      hasMore: pagination?.hasMore ?? false, // 使用逻辑或操作符确保 hasMore 永远不会是 undefined
      pageSize: pageSize // 确保 pageSize 总是有一个有效的数字值
  };

  return { data, isLoading, pagination: paginationConfig };
}
