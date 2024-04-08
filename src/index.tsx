import { useEffect, useState } from "react";

import { Image as RayImage, Icon, List, Action, ActionPanel } from "@raycast/api";
import { ExtensionMeta, SearchFilter } from "@/model/npmResponse.model";
import { usePromise } from "@raycast/utils";
import { fullSearch } from "chrome-extension-meta";
const rateFilters: Array<SearchFilter> = [
  {
    index: 0,
    title: "not limit rate",
    minRate: "0",
  },
  {
    index: 1,
    title: "3 stars and up",
    minRate: "3",
  },
  {
    index: 2,
    title: "4 stars and up",
    minRate: "4",
  },
  {
    index: 3,
    title: "5 stars",
    minRate: "5",
  },
];
// 获取状态颜色
function getStatusColor(rating: string) {
  const rate = parseFloat(rating);
  if (rate < 3) {
    return "#FF0000";
  } else if (rate < 4) {
    return "#FFA500";
  } else {
    return "#32CD32";
  }
}
// rating 保留一位小数
function toFixed(num: string, fractionDigits = 1) {
  const numFloat = parseFloat(num);
  return numFloat.toFixed(fractionDigits);
}
function getChromeExtensionUrl(id: string) {
  return `https://chrome.google.com/webstore/detail/${id}`;
}

function getStatusAccessoryext(ext: ExtensionMeta) {
  const accessory: List.Item.Accessory = {
    icon: {
      source: Icon.Star,
      tintColor: getStatusColor(ext.rating),
    },
    tooltip: `Rating: ${toFixed(ext.rating)}`,
  };
  return accessory;
}

export default function MDNSearchResultsList() {
  const [query, setQuery] = useState<null | string>(null);
  const [minRate, setMinRate] = useState<string>("0");
  // const { data, isLoading, pagination } = useSearch(query, 10);
  const [loadedData, setLoadedData] = useState<ExtensionMeta[]>([]); // 用于存储已加载的数据

  //ts-ignore
  const { isLoading, data, pagination } = usePromise(
    (searchText: string) => async (options: { page: number }) => {
      console.log("options", options);

      const page = options.page;
      const page_ = page + 1;
      const response = await fullSearch(searchText, {
        limit: page_ * 13,
      });
      const allData = response.data as unknown as ExtensionMeta[];
      console.log('allData', allData)
      const yesData = allData.filter((item) => !!item.iconURL && !!item.title && !!item.description && !!item.id);
      const newData = yesData.filter((item) => !loadedData.some((ld) => ld.id === item.id)); // 过滤掉已加载的数据
      if (newData.length === 0) {
        return { data: [], hasMore: false };
      }
      console.log("newData", newData.length);
      const combinedData = [...loadedData, ...newData];
      setTimeout(() => setLoadedData(combinedData), 1000); // 模拟加载延迟

      return { data: newData, hasMore: true };
    },
    [query],
  );
  useEffect(() => {
    console.log("pagination", pagination);
  }, [pagination]);

  useEffect(() => {
    setLoadedData([]);
  }, [query]);
  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Type to search MDN..."
      onSearchTextChange={(text) => setQuery(text)}
      pagination={pagination}
      throttle
      searchBarAccessory={
        <List.Dropdown
          tooltip="Select Locale"
          storeValue={true}
          onChange={(newValue) => {
            setMinRate(newValue);
          }}
        >
          {rateFilters.map((item) => (
            <List.Dropdown.Item
              key={item.index}
              title={item.title}
              value={item.minRate}
              keywords={[item.title, item.minRate]}
            />
          ))}
        </List.Dropdown>
      }
    >
      {(data || []).map((result, idx) => (
        <List.Item
          key={idx}
          title={result.title.toString()}
          icon={{ source: result.iconURL ?? Icon.MinusCircle, mask: RayImage.Mask.RoundedRectangle }}
          subtitle={result.description}
          accessories={[getStatusAccessoryext(result)]}
          actions={
            <ActionPanel title={result.title}>
              <ActionPanel.Section>
                <Action.OpenInBrowser url={getChromeExtensionUrl(result.id)} />
              </ActionPanel.Section>
              <ActionPanel.Section title="copy">
                <Action.CopyToClipboard
                  title="Copy Name"
                  content={result.title}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "c" }} />
                <Action.CopyToClipboard
                  title="Copy Web Url"
                  content={getChromeExtensionUrl(result.id)}
                  shortcut={{ modifiers: ["opt", "shift"], key: "c" }}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
