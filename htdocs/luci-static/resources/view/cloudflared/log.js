/* SPDX-License-Identifier: GPL-3.0-only
 *
 * Copyright (C) 2024 ImmortalWrt.org
 */

'use strict';
'require fs';
'require ui';
'require view';
'require poll';

function formatDate(dateTime) {
	var date = new Date(dateTime);
	var formattedDate = date.toISOString().slice(0, 10);
	var formattedTime = date.toISOString().slice(11, 19);
	return formattedDate + ' ' + formattedTime;
}

function formatLogEntry(logObj) {
	var tunnelIDMessage = logObj.tunnelID ? ', ID: ' + logObj.tunnelID : '';
	var errorMessage = logObj.error ? ', Error: ' + logObj.error : '';
	var ipMessage = logObj.ip ? ', IP: ' + logObj.ip : '';
	var configMessage = logObj.config ? ', Config: ' + JSON.stringify(logObj.config) : '';
	var connectionMessage = logObj.connection ? ', Connection: ' + JSON.stringify(logObj.connection) : '';
	var locationMessage = logObj.location ? ', Location: ' + logObj.location : '';
	var protocolMessage = logObj.protocol ? ', Protocol: ' + logObj.protocol : '';
	return '[' + formatDate(logObj.time) + '] [' + logObj.level + '] : ' + logObj.message + ipMessage + tunnelIDMessage + errorMessage + configMessage + connectionMessage + locationMessage + protocolMessage;
}

return view.extend({
	handleSaveApply: null,
	handleSave: null,
	handleReset: null,
	load: function() {
		poll.add(function () {
			return fs.read('/var/log/cloudflared.log').then(function(res) {
				if (!res || res.trim() === '') {
					ui.addNotification(null, E('p', {}, _('Unable to read the interface info from /var/log/cloudflared.log.')));
					return '';
				}

				var logs = res.trim().split('\n').map(function(entry) {
					try {
						var logObj = JSON.parse(entry);
						return logObj.time && logObj.message && logObj.level
							? formatLogEntry(logObj)
							: '';
					} catch (error) {
						return '';
					}
				});

				logs = logs.filter(function(entry) {
					return entry.trim() !== '';
				});

				var info = logs.join('\n');
				var view = document.getElementById('syslog');
				var filterLevel = document.getElementById('filter-level').value;
				var logDirection = document.getElementById('log-direction').value;

				if (view) {
					var filteredLogs;
					if (filterLevel !== 'all') {
						filteredLogs = logs.filter(function(entry) {
							var logLevel = entry.match(/\[.*\] \[(.*)\]/)[1].toLowerCase();
							return logLevel.includes(filterLevel.toLowerCase());
						});
					} else {
						filteredLogs = logs;
					}

					if (logDirection === 'up') {
						filteredLogs = filteredLogs.reverse();
					}

					info = filteredLogs.join('\n');
					view.innerHTML = info;
				}

				return info;
			});
		});

		return Promise.resolve('');
	},
	render: function(info) {
		return E([], [
			E('h2', { 'class': 'section-title' }, _('Cloudflared Logs')),
			E('div', { 'id': 'logs' }, [
				E('label', { 'for': 'filter-level', 'style': 'margin-right: 8px;' }, _('Filter Log:')),
				E('select', { 'id': 'filter-level', 'style': 'margin-right: 8px;' }, [
					E('option', { 'value': 'all', 'selected': 'selected' }, _('All')),
					E('option', { 'value': 'info' }, _('Information')),
					E('option', { 'value': 'warn' }, _('Warning')),
					E('option', { 'value': 'error' }, _('Error')),
				]),
				E('label', { 'for': 'log-direction', 'style': 'margin-right: 8px;' }, _('Log Direction:')),
				E('select', { 'id': 'log-direction', 'style': 'margin-right: 8px;' }, [
					E('option', { 'value': 'down', 'selected': 'selected' }, _('Down')),
					E('option', { 'value': 'up' }, _('Up')),
				]),
				E('button', {
					'id': 'download-log',
					'class': 'cbi-button cbi-button-save',
					'click': L.bind(this.handleDownloadLog, this)
				}, _('Download Log')),
				E('textarea', {
					'id': 'syslog',
					'class': 'cbi-input-textarea',
					'style': 'height: 500px; overflow-y: scroll; margin-top: 8px;',
					'readonly': 'readonly',
					'wrap': 'off',
					'rows': 1
				}, [ info ])
			])
		]);
	},

	handleDownloadLog: function() {
		var logs = document.getElementById('syslog').value;
		var blob = new Blob([logs], { type: 'text/plain' });
		var link = document.createElement('a');
		link.href = window.URL.createObjectURL(blob);
		link.download = 'cloudflared.log';
		link.click();
	}
});
