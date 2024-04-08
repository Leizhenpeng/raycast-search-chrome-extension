import { useEffect, useState } from "react";

import { Image as RayImage, Icon, List, Action, ActionPanel, Color } from "@raycast/api";
import { SearchFilter } from "@/model/npmResponse.model";
import { usePromise } from "@raycast/utils";
import { fullSearch } from "chrome-extension-meta";
import { title } from 'process';
import { Result } from '@/types';
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
  if (isNaN(rate)) {
    return Color.Orange
  }
  if (rate < 3) {
    return Color.Red
  } else if (rate < 4) {
    return Color.Yellow
  } else {
    return Color.Green
  }
}
// rating 保留一位小数
function toFixed(num: string, fractionDigits = 1) {
  const numFloat = parseFloat(num);
  if (isNaN(numFloat)) {
    return "No Rated";
  }
  return numFloat.toFixed(fractionDigits);
}
function getChromeExtensionUrl(id: string) {
  return `https://chrome.google.com/webstore/detail/${id}`;
}

function getStatusAccessoryext(ext: ExtensionMeta) {
  const accessory: List.Item.Accessory = {
    icon: {
      source: Icon.CircleFilled,
      tintColor: getStatusColor(ext.rating),
    },
    tooltip: `Rating: ${toFixed(ext.rating)}`,
  };
  return accessory;
}



function getFullUrl(url: string) {
  try {
    const urlObj = new URL("https://" + url);

    return urlObj.href;
  } catch (e) {
    return url;
  }
}

function isNullString(str: string | null): str is null {
  return str === 'null' || str === null;
}

export default function MDNSearchResultsList() {
  const [query, setQuery] = useState<null | string>(null);
  const [minRate, setMinRate] = useState<string>("0");
  // const { data, isLoading, pagination } = useSearch(query, 10);
  const [loadedData, setLoadedData] = useState<ExtensionMeta[]>([]); // 用于存储已加载的数据

  //ts-ignore
  const { isLoading, data, pagination } = usePromise(
    (searchText: string) => async (options: { page: number }) => {
      // console.log("options", options);

      const { page } = options;
      const pageSize = 13;
      const offset = page * pageSize;
      const response = await fullSearch(searchText, { limit: offset + pageSize });
      const allData = response.data;
      console.log('allData', allData);

      // 筛选有效数据，并且去除已加载的数据
      const filteredData = allData
        .filter(item => item.iconURL && item.title && item.description && item.id)
        .filter(item => !loadedData.some(ld => ld.id === item.id));

      console.log("filteredData", filteredData.length);

      if (filteredData.length === 0) {
        return { data: [], hasMore: false };
      }

      // 更新已加载数据
      const updatedLoadedData = [...loadedData, ...filteredData];
      setTimeout(() => setLoadedData(updatedLoadedData), 1000); // 模拟加载延迟

      return { data: filteredData, hasMore: true };
    },
    [query],
  );

  // useEffect(() => {
  //   console.log("pagination", pagination);
  // }, [pagination]);

  useEffect(() => {
    setLoadedData([]);
  }, [query]);
  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Type to search MDN..."
      onSearchTextChange={(text) => setQuery(text)}
      pagination={pagination}
      selectedItemId={data?.[0]?.id.toString()}
      throttle
      isShowingDetail
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
          // subtitle={result.description??""}
          accessories={[getStatusAccessoryext(result)]}
          detail={
            <List.Item.Detail
              //  coverURL
              markdown={
                `![cover](${result.coverURL})` 
              }
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Link title="Title"
                    text={result.title} target={getChromeExtensionUrl(getChromeExtensionUrl(result.id))} />

                  {
                    result.publish && !isNullString(result.publish) && (
                      <>
                        <List.Item.Detail.Metadata.Separator />

                        <List.Item.Detail.Metadata.Link title="Author"
                          text={result.publish} target={getFullUrl(result.publish)} />
                      </>
                    )
                  }


                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label
                    title={`Description`}
                    text={result.description}
                  />
                  <List.Item.Detail.Metadata.Separator />

                  <List.Item.Detail.Metadata.Label
                    icon={Icon.Star}
                    title={`Rating`}
                    text={toFixed(result.rating)}
                  />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label
                    title={`Review Count`}
                    text={ isNullString(result.reviewCount) ? "0" : result.reviewCount }
                  />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label
                    title={`Active User`}
                    text={result.userCount ?? "0"}
                  />

                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.TagList title="Tag" >
                    {
                      result.category && result.category.split('/').map((item) => (
                        <List.Item.Detail.Metadata.TagList.Item text={item} />
                      ))
                    }
                  </List.Item.Detail.Metadata.TagList>
                </List.Item.Detail.Metadata>
              }
            >

            </List.Item.Detail>
          }
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
