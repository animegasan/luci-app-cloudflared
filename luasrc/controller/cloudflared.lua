module("luci.controller.cloudflared", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/cloudflared") then
		return
	end

	entry({"admin", "vpn"}, firstchild(), "VPN", 45).dependent = false
	entry({"admin", "vpn", "cloudflared"}, cbi("cloudflared"), _("Cloudflare"), 31).dependent = true
	entry({"admin", "vpn", "cloudflared", "status"}, call("act_status")).leaf = true
end

function act_status()
	local e = {}
	e.running = luci.sys.call("pgrep /usr/bin/cloudflared >/dev/null") == 0
	luci.http.prepare_content("application/json")
	luci.http.write_json(e)
end
