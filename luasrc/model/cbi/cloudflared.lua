local o = require "luci.sys"
local a, t, e
a = Map("cloudflared", translate("Cloudflare Zero Trust"))
a.description = translate("Zero Trust Security services from Cloudflare to help you get maximum security both from outside and within the network.") .. [[<br/><br/><a href="https://github.com/animegasan" target="_blank">Powered by animegasan</a>]]
a.template = "cloudflared/index"

t = a:section(NamedSection, "config", "cloudflared")
t.anonymous = true
t.addremove = false
---- status
e = t:option(DummyValue, "status", translate("Status"))
e.template = "cloudflared/status"
e.value = translate("Collecting data...")
---- enable
e = t:option(Flag, "enabled", translate("Enable"))
e.default = 0
e.rmempty = false
---- token
e = t:option(DynamicList, "token", translate('Token'))
e.password = true
e.rmempty = false
---- cloudflare zero trust
e = t:option(DummyValue, "opennewwindow", translate("<input type=\"button\" class=\"cbi-button cbi-button-apply\" value=\"Cloudflare Zero Trust\" onclick=\"window.open('https://one.dash.cloudflare.com')\" />"))
e.description = translate("Create or manage your cloudflare network")

return a
