local MyHeader = {}

MyHeader.PRIORITY = 1000

function MyHeader:header_filter(conf)
  kong.response.set_header("myheader", conf.header_value)
end

return MyHeader

